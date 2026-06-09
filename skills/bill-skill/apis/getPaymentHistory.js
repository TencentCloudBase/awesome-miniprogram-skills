// skills/bill-skill/apis/getPaymentHistory.js
const { isPreviewMode, defaultPaymentHistory, successResult, errorResult, getOpenid } = require('../utils/util')

async function getPaymentHistory(params) {
  try {
    console.info('[ai-mode] [bill-skill] getPaymentHistory called')

    if (isPreviewMode()) {
      const items = defaultPaymentHistory()
      const totalAmount = items.reduce((sum, h) => sum + h.amount, 0)

      const msg = items.length > 0
        ? `查询到 ${items.length} 条缴费记录，共 ¥${totalAmount.toFixed(2)}`
        : '暂无缴费记录'

      return successResult(msg, {
        items,
        total: items.length,
        totalAmount: Math.round(totalAmount * 100) / 100
      })
    }

    // 正式模式调云函数
    const { result } = await wx.cloud.callFunction({
      name: 'bill-skill-handler',
      data: { action: 'getPaymentHistory', openid: getOpenid() }
    })
    if (result && result.code === 0) {
      const d = result.data
      const msg = d.items.length > 0
        ? `查询到 ${d.items.length} 条缴费记录，共 ¥${d.totalAmount.toFixed(2)}`
        : '暂无缴费记录'
      return successResult(msg, d)
    }
    return errorResult(result?.message || '查询缴费记录失败')
  } catch (err) {
    console.error('[ai-mode] [bill-skill] getPaymentHistory error:', err.message)
    return errorResult('查询缴费记录失败，请稍后重试')
  }
}

module.exports = getPaymentHistory
