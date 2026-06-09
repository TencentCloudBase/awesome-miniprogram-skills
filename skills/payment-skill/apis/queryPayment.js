// skills/payment-skill/apis/queryPayment.js
const { isPreviewMode, errorResult, successResult, mockQueryResult } = require('../utils/util')

async function queryPayment(params = {}) {
  console.info('[ai-mode] queryPayment 入口, params=', JSON.stringify(params))
  const { orderId } = params || {}

  if (!orderId) {
    return errorResult('缺少 orderId。请从 createPayment 返回值获取。')
  }

  if (isPreviewMode()) {
    console.info('[ai-mode] queryPayment 预览模式')
    const data = mockQueryResult(orderId)
    return successResult(
      `订单 ${orderId} 支付成功。`,
      data
    )
  }

  try {
    const { result } = await wx.cloud.callFunction({
      name: 'payment-handler',
      data: {
        action: 'queryPayment',
        orderId
      }
    })

    if (result && result.code === 0 && result.data) {
      const d = result.data
      const statusText = d.status === 'success' ? '支付成功' : d.status === 'fail' ? '支付失败' : '支付中'
      return successResult(
        `订单 ${orderId} ${statusText}。`,
        d
      )
    }
    return errorResult(result?.message || '查询支付状态失败')
  } catch (err) {
    console.error('[ai-mode] queryPayment error:', err.message)
    return errorResult('查询支付状态失败，请稍后重试')
  }
}

module.exports = queryPayment
