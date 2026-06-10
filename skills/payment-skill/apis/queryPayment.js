// skills/payment-skill/apis/queryPayment.js
const { isPreviewMode, errorResult, successResult, mockQueryResult, callPayCommon } = require('../utils/util')

async function queryPayment(params = {}) {
  console.info('[ai-mode] queryPayment 入口, params=', JSON.stringify(params))
  const { orderId } = params || {}

  if (!orderId) {
    return errorResult('缺少 orderId。请从 createPayment 返回值获取。')
  }

  if (isPreviewMode()) {
    console.info('[ai-mode] queryPayment 预览模式')
    const data = mockQueryResult(orderId)
    return successResult(`订单 ${orderId} 支付成功。`, data)
  }

  try {
    const result = await callPayCommon('wxpay_query_order_by_out_trade_no', {
      out_trade_no: orderId
    })

    if (result && result.code === 0 && result.data) {
      const d = result.data
      const status = d.trade_state === 'SUCCESS' ? 'success'
                   : d.trade_state === 'CLOSED' || d.trade_state === 'PAY_ERROR' ? 'fail'
                   : 'pending'
      const statusText = status === 'success' ? '支付成功' : status === 'fail' ? '支付失败' : '支付中'
      return successResult(
        `订单 ${orderId} ${statusText}。`,
        {
          orderId,
          status,
          payTime: d.success_time || '',
          transactionId: d.transaction_id || ''
        }
      )
    }
    return errorResult(result?.msg || result?.message || '查询支付状态失败')
  } catch (err) {
    console.error('[ai-mode] queryPayment error:', err.message)
    return errorResult('查询支付状态失败，请稍后重试')
  }
}

module.exports = queryPayment
