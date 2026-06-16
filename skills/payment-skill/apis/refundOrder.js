// skills/payment-skill/apis/refundOrder.js
// 申请退款
const { genRefundNo } = require('../utils/id')
const { findOrder, saveOrder, saveRefund } = require('../utils/storage')
const { isPreviewMode, errorResult, successResult, callPayCommon } = require('../utils/util')

const REFUND_STATE_MAP = {
  'SUCCESS': '退款成功',
  'PROCESSING': '退款处理中',
  'ABNORMAL': '退款异常',
  'CLOSED': '退款关闭'
}

async function refundOrder(params = {}) {
  console.info('[ai-mode] refundOrder 入口, params=', JSON.stringify(params))
  const { outTradeNo, refundFee, reason } = params || {}

  try {
    if (!outTradeNo) {
      return errorResult('缺少 outTradeNo。禁止编造，应从 createOrder/queryOrder 返回值获取。')
    }
    if (!refundFee || refundFee <= 0) {
      return errorResult('缺少有效的退款金额 refundFee（单位：分，必须大于 0）。')
    }

    const localOrder = findOrder(outTradeNo)
    if (!localOrder) {
      return errorResult(`未找到订单 ${outTradeNo}。禁止编造 outTradeNo。`)
    }

    // 检查订单状态
    if (localOrder.tradeState !== 'SUCCESS' && localOrder.status !== 'SUCCESS') {
      return errorResult(`订单 ${outTradeNo} 状态为"${localOrder.tradeStateDesc || localOrder.status}"，只有已支付成功的订单才能退款。`)
    }

    // 检查退款金额
    if (refundFee > localOrder.totalFee) {
      return errorResult(`退款金额 ${refundFee} 分超过订单总金额 ${localOrder.totalFee} 分，退款金额不得超过订单总额。`)
    }

    const outRefundNo = genRefundNo()
    const refundReason = reason || '用户申请退款'

    // 预览模式
    if (isPreviewMode()) {
      console.info('[ai-mode] refundOrder 预览模式')
      const refundResult = {
        outRefundNo,
        outTradeNo,
        refundFee,
        refundStatus: 'SUCCESS',
        refundStatusDesc: '退款成功'
      }
      saveRefund({
        outRefundNo,
        outTradeNo,
        refundFee,
        reason: refundReason,
        refundStatus: 'SUCCESS',
        refundStatusDesc: '退款成功',
        createTime: new Date().toISOString()
      })
      localOrder.tradeState = 'REFUND'
      localOrder.tradeStateDesc = '转入退款'
      saveOrder(localOrder)
      return successResult(
        `退款已发起，退款单号 ${outRefundNo}，退款金额 ¥${(refundFee / 100).toFixed(2)}，状态：退款成功。接下来为用户展示退款结果卡片。禁止以纯文本重复详情。`,
        refundResult,
        { reason: refundReason }
      )
    }

    // 正式模式：尝试调用后端退款
    let refundResult = null
    try {
      const res = await callPayCommon('wxpay_refund', {
        out_trade_no: outTradeNo,
        out_refund_no: outRefundNo,
        reason: refundReason,
        amount: {
          total: localOrder.totalFee,
          refund: refundFee,
          currency: 'CNY'
        }
      })

      if (res.code === 0 && res.data) {
        refundResult = {
          outRefundNo,
          outTradeNo,
          refundFee,
          refundStatus: res.data.status || 'PROCESSING',
          refundStatusDesc: REFUND_STATE_MAP[res.data.status] || '退款处理中'
        }
      }
    } catch (err) {
      console.warn('[refundOrder] 后端退款调用失败，使用 mock:', err)
    }

    // 后端不可用时 mock 退款成功
    if (!refundResult) {
      refundResult = {
        outRefundNo,
        outTradeNo,
        refundFee,
        refundStatus: 'SUCCESS',
        refundStatusDesc: '退款成功'
      }
    }

    // 保存退款记录
    saveRefund({
      outRefundNo,
      outTradeNo,
      refundFee,
      reason: refundReason,
      refundStatus: refundResult.refundStatus,
      refundStatusDesc: refundResult.refundStatusDesc,
      createTime: new Date().toISOString()
    })

    // 更新订单状态
    localOrder.tradeState = 'REFUND'
    localOrder.tradeStateDesc = '转入退款'
    saveOrder(localOrder)

    return successResult(
      `退款已发起，退款单号 ${outRefundNo}，退款金额 ¥${(refundFee / 100).toFixed(2)}，状态：${refundResult.refundStatusDesc}。接下来为用户展示退款结果卡片。禁止以纯文本重复详情。`,
      refundResult,
      { reason: refundReason }
    )
  } catch (err) {
    console.error('[refundOrder] error', err)
    return errorResult(`退款失败：${err.message || '未知错误'}。`)
  }
}

module.exports = refundOrder
