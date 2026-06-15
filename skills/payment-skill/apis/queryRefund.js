// skills/payment-skill/apis/queryRefund.js
// 查询退款状态
const { findRefund, saveRefund } = require('../utils/storage')
const { isPreviewMode, errorResult, successResult, callPayCommon } = require('../utils/util')

const REFUND_STATE_MAP = {
  'SUCCESS': '退款成功',
  'PROCESSING': '退款处理中',
  'ABNORMAL': '退款异常',
  'CLOSED': '退款关闭'
}

async function queryRefund(params = {}) {
  console.info('[ai-mode] queryRefund 入口, params=', JSON.stringify(params))
  const { outRefundNo } = params || {}

  try {
    if (!outRefundNo) {
      return errorResult('缺少 outRefundNo。禁止编造，应从 refundOrder 返回值获取。')
    }

    // 预览模式：从本地 storage 读取
    if (isPreviewMode()) {
      console.info('[ai-mode] queryRefund 预览模式')
      const localRefund = findRefund(outRefundNo)
      if (!localRefund) {
        return errorResult(`未找到退款单 ${outRefundNo}。禁止编造 outRefundNo，应从 refundOrder 返回值获取。`)
      }
      const refundData = {
        outRefundNo: localRefund.outRefundNo,
        outTradeNo: localRefund.outTradeNo || '',
        refundFee: localRefund.refundFee || 0,
        refundStatus: localRefund.refundStatus || 'PROCESSING',
        refundStatusDesc: localRefund.refundStatusDesc || REFUND_STATE_MAP[localRefund.refundStatus] || '未知状态'
      }
      return successResult(
        `退款单 ${refundData.outRefundNo} 状态：${refundData.refundStatusDesc}，退款金额 ¥${(refundData.refundFee / 100).toFixed(2)}。接下来展示退款状态卡片。禁止以纯文本重复详情。`,
        refundData
      )
    }

    // 正式模式：尝试调用后端查询
    let refundData = null
    try {
      const res = await callPayCommon('wxpay_refund_query', {
        out_refund_no: outRefundNo
      })

      if (res.code === 0 && res.data) {
        refundData = {
          outRefundNo: res.data.out_refund_no || outRefundNo,
          outTradeNo: res.data.out_trade_no || '',
          refundFee: res.data.amount?.refund || 0,
          refundStatus: res.data.status || 'PROCESSING',
          refundStatusDesc: REFUND_STATE_MAP[res.data.status] || '未知状态'
        }

        // 同步更新本地
        const localRefund = findRefund(outRefundNo)
        if (localRefund) {
          localRefund.refundStatus = refundData.refundStatus
          localRefund.refundStatusDesc = refundData.refundStatusDesc
          saveRefund(localRefund)
        }
      }
    } catch (err) {
      console.warn('[queryRefund] 后端查询失败，读取本地数据:', err)
    }

    // 后端不可用时从本地读取
    if (!refundData) {
      const localRefund = findRefund(outRefundNo)
      if (!localRefund) {
        return errorResult(`未找到退款单 ${outRefundNo}。禁止编造 outRefundNo，应从 refundOrder 返回值获取。`)
      }
      refundData = {
        outRefundNo: localRefund.outRefundNo,
        outTradeNo: localRefund.outTradeNo || '',
        refundFee: localRefund.refundFee || 0,
        refundStatus: localRefund.refundStatus || 'PROCESSING',
        refundStatusDesc: localRefund.refundStatusDesc || REFUND_STATE_MAP[localRefund.refundStatus] || '未知状态'
      }
    }

    return successResult(
      `退款单 ${refundData.outRefundNo} 状态：${refundData.refundStatusDesc}，退款金额 ¥${(refundData.refundFee / 100).toFixed(2)}。接下来展示退款状态卡片。禁止以纯文本重复详情。`,
      refundData
    )
  } catch (err) {
    console.error('[queryRefund] error', err)
    return errorResult(`查询退款失败：${err.message || '未知错误'}。`)
  }
}

module.exports = queryRefund
