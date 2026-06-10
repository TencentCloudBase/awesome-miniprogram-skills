// skills/bill-skill/apis/getBills.js
const { isPreviewMode, defaultBillList, successResult, errorResult } = require('../utils/util')

async function getBills(params) {
  try {
    console.info('[ai-mode] [bill-skill] getBills called')

    if (isPreviewMode()) {
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
    }

    // 正式模式调云函数
    const { result } = await wx.cloud.callFunction({ name: 'bill-skill-handler', data: { action: 'getBills' } })
    if (result && result.code === 0) {
      const d = result.data
      const msg = d.items.length > 0
        ? `查询到 ${d.items.length} 笔待缴账单，合计 ¥${d.totalAmount.toFixed(2)}`
        : '暂无待缴账单'
      return successResult(msg, d)
    }
    return errorResult(result?.message || '查询账单失败')
  } catch (err) {
    console.error('[ai-mode] [bill-skill] getBills error:', err.message)
    return errorResult('查询账单失败，请稍后重试')
  }
}

module.exports = getBills
