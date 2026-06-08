// skills/bill-skill/apis/getPaymentHistory.js
const { defaultPaymentHistory, successResult, errorResult } = require('../utils/util')

async function getPaymentHistory(params) {
  try {
    console.info('[ai-mode] [bill-skill] getPaymentHistory called')
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
  } catch (err) {
    console.error('[ai-mode] [bill-skill] getPaymentHistory error:', err.message)
    return errorResult('查询缴费记录失败，请稍后重试')
  }
}

module.exports = getPaymentHistory
