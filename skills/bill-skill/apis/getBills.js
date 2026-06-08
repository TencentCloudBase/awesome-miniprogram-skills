// skills/bill-skill/apis/getBills.js
const { defaultBillList, successResult, errorResult } = require('../utils/util')

async function getBills(params) {
  try {
    console.info('[ai-mode] [bill-skill] getBills called')
    const items = defaultBillList()
    const totalAmount = items.reduce((sum, b) => sum + b.amount, 0)
    const overdueCount = items.filter((b) => b.overdue).length

    const msg = items.length > 0
      ? `查询到 ${items.length} 笔待缴账单，合计 ¥${totalAmount.toFixed(2)}`
      : '暂无待缴账单'

    return successResult(msg, {
      items,
      total: items.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      overdueCount
    })
  } catch (err) {
    console.error('[ai-mode] [bill-skill] getBills error:', err.message)
    return errorResult('查询账单失败，请稍后重试')
  }
}

module.exports = getBills
