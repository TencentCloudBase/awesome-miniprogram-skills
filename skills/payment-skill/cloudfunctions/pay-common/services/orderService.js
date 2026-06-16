/**
 * 订单服务（业务钩子）
 *
 * 使用 CloudBase 数据库记录支付、退款、转账信息。
 * 集合：
 *   - payment_records   支付记录
 *   - refund_records    退款记录
 *   - transfer_records  转账记录
 *
 * 关键提醒：
 * 1. 所有回调处理（Trigger）方法必须做幂等检查
 * 2. 回调中应核验金额与原始金额是否一致（防篡改）
 * 3. 上述集合已在 cloudbaserc.json 中声明，运行 npx mp-skills setup 会自动创建
 */

const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

class OrderService {
    constructor() {}

    /**
     * 下单成功后记录订单
     * @param {Object} params - { out_trade_no, description, amount, payer, attach, skill_name }
     */
    async handlerUnified(params) {
        const openid = params.payer?.openid || ''
        const skillName = params.skill_name || ''
        const amountCents = params.amount?.total || 0

        try {
            // 幂等：已存在则跳过
            const existing = await db.collection('payment_records')
                .where({ orderId: params.out_trade_no })
                .limit(1)
                .get()
            if (existing.data && existing.data.length > 0) {
                console.info('[OrderService] handlerUnified 跳过（已存在）:', params.out_trade_no)
                return true
            }

            await db.collection('payment_records').add({
                data: {
                    _openid: openid,
                    orderId: params.out_trade_no,
                    skillName,
                    totalAmount: amountCents,
                    description: params.description || '',
                    status: 'pending',
                    createTime: db.serverDate()
                }
            })
            console.info('[OrderService] handlerUnified 记录成功:', params.out_trade_no)
        } catch (e) {
            console.error('[OrderService] handlerUnified 写入失败:', e.message)
        }
        return true
    }

    /**
     * 支付回调 - 更新订单状态为已支付
     * 幂等实现：先查询状态，已支付则跳过
     * 注意：数据库写入失败时抛出异常，让微信支付重试回调
     */
    async handlerUnifiedTrigger(params) {
        const orderId = params.out_trade_no
        const transactionId = params.transaction_id
        const tradeState = params.trade_state

        const existing = await db.collection('payment_records')
            .where({ orderId })
            .limit(1)
            .get()

        if (!existing.data || existing.data.length === 0) {
            console.warn('[OrderService] handlerUnifiedTrigger 订单不存在:', orderId)
            // 订单不存在可能是时序问题，抛错让微信重试
            throw new Error(`订单 ${orderId} 不存在，等待重试`)
        }

        const record = existing.data[0]
        if (record.status === 'paid') {
            console.info('[OrderService] handlerUnifiedTrigger 幂等跳过（已支付）:', orderId)
            return true
        }

        // 金额校验
        const paidAmount = params.amount?.total || 0
        if (paidAmount > 0 && paidAmount !== record.totalAmount) {
            console.error('[OrderService] handlerUnifiedTrigger 金额不匹配:',
                '期望', record.totalAmount, '实际', paidAmount)
            throw new Error(`订单 ${orderId} 金额不匹配: 期望 ${record.totalAmount}, 实际 ${paidAmount}`)
        }

        if (tradeState === 'SUCCESS') {
            await db.collection('payment_records')
                .where({ orderId })
                .update({
                    data: {
                        status: 'paid',
                        transactionId,
                        payTime: params.success_time || db.serverDate(),
                        updateTime: db.serverDate()
                    }
                })
            console.info('[OrderService] handlerUnifiedTrigger 更新成功:', orderId, transactionId)
        }
        return true
    }

    /**
     * 退款申请成功后记录
     * @param {Object} params - { out_trade_no, out_refund_no, amount: { refund, total }, reason }
     */
    async handlerRefund(params) {
        const orderId = params.out_trade_no
        const refundId = params.out_refund_no

        try {
            // 幂等：已存在则跳过
            const existing = await db.collection('refund_records')
                .where({ refundId })
                .limit(1)
                .get()
            if (existing.data && existing.data.length > 0) {
                console.info('[OrderService] handlerRefund 跳过（已存在）:', refundId)
                return true
            }

            await db.collection('refund_records').add({
                data: {
                    orderId,
                    refundId,
                    refundAmount: params.amount?.refund || 0,
                    totalAmount: params.amount?.total || 0,
                    reason: params.reason || '',
                    status: 'processing',
                    createTime: db.serverDate()
                }
            })
            console.info('[OrderService] handlerRefund 记录成功:', refundId)
        } catch (e) {
            console.error('[OrderService] handlerRefund 写入失败:', e.message)
        }
        return true
    }

    /**
     * 退款回调 - 更新退款状态
     * 幂等实现：先查询状态，已完成则跳过
     * 注意：数据库写入失败时抛出异常，让微信支付重试回调
     * @param {Object} params - { out_refund_no, out_trade_no, refund_status, amount, success_time }
     */
    async handlerRefundTrigger(params) {
        const refundId = params.out_refund_no
        const refundStatus = params.refund_status // SUCCESS / CHANGE / ABNORMAL

        const existing = await db.collection('refund_records')
            .where({ refundId })
            .limit(1)
            .get()

        if (!existing.data || existing.data.length === 0) {
            console.warn('[OrderService] handlerRefundTrigger 退款记录不存在:', refundId)
            throw new Error(`退款记录 ${refundId} 不存在，等待重试`)
        }

        const record = existing.data[0]
        if (record.status === 'success' || record.status === 'closed') {
            console.info('[OrderService] handlerRefundTrigger 幂等跳过:', refundId)
            return true
        }

        const statusMap = {
            'SUCCESS': 'success',
            'CHANGE': 'changed',
            'ABNORMAL': 'abnormal'
        }

        await db.collection('refund_records')
            .where({ refundId })
            .update({
                data: {
                    status: statusMap[refundStatus] || refundStatus,
                    successTime: params.success_time || '',
                    updateTime: db.serverDate()
                }
            })
        console.info('[OrderService] handlerRefundTrigger 更新成功:', refundId, refundStatus)
        return true
    }

    /**
     * 转账受理成功后记录
     * @param {Object} params - { out_bill_no, openid, transfer_amount, transfer_remark }
     * @param {Object} result - 转账接口返回结果
     */
    async handlerTransfer(params, result) {
        const billNo = params.out_bill_no

        try {
            // 幂等：已存在则跳过
            const existing = await db.collection('transfer_records')
                .where({ billNo })
                .limit(1)
                .get()
            if (existing.data && existing.data.length > 0) {
                console.info('[OrderService] handlerTransfer 跳过（已存在）:', billNo)
                return true
            }

            await db.collection('transfer_records').add({
                data: {
                    billNo,
                    openid: params.openid || '',
                    transferAmount: params.transfer_amount || 0,
                    remark: params.transfer_remark || '',
                    transferBillNo: result?.transfer_bill_no || '',
                    status: 'processing',
                    createTime: db.serverDate()
                }
            })
            console.info('[OrderService] handlerTransfer 记录成功:', billNo)
        } catch (e) {
            console.error('[OrderService] handlerTransfer 写入失败:', e.message)
        }
        return true
    }

    /**
     * 转账回调 - 更新转账状态
     * 幂等实现：先查询状态，已完成则跳过
     * 注意：数据库写入失败时抛出异常，让微信支付重试回调
     * @param {Object} params - { out_bill_no, state, fail_reason, update_time }
     */
    async handlerTransferTrigger(params) {
        const billNo = params.out_bill_no
        const state = params.state // SUCCESS / FAIL

        const existing = await db.collection('transfer_records')
            .where({ billNo })
            .limit(1)
            .get()

        if (!existing.data || existing.data.length === 0) {
            console.warn('[OrderService] handlerTransferTrigger 转账记录不存在:', billNo)
            throw new Error(`转账记录 ${billNo} 不存在，等待重试`)
        }

        const record = existing.data[0]
        if (record.status === 'success' || record.status === 'fail') {
            console.info('[OrderService] handlerTransferTrigger 幂等跳过:', billNo)
            return true
        }

        const statusMap = {
            'SUCCESS': 'success',
            'FAIL': 'fail'
        }

        await db.collection('transfer_records')
            .where({ billNo })
            .update({
                data: {
                    status: statusMap[state] || state,
                    failReason: params.fail_reason || '',
                    updateTime: db.serverDate()
                }
            })
        console.info('[OrderService] handlerTransferTrigger 更新成功:', billNo, state)
        return true
    }
}

module.exports = OrderService;
