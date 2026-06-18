/**
 * getStatistics - 分类统计和趋势分析
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  fenToYuan,
  getToday,
  getMonthStart,
  getCurrentMonth
} = require('../utils/util')
const { getLocalRecords, getLocalBudgets } = require('../utils/storage')

async function getStatistics(params = {}) {
  const {
    startDate = getMonthStart(),
    endDate = getToday(),
    type = 'expense',
    groupBy = 'category'
  } = params

  // 预览模式
  if (isPreviewMode()) {
    let records = getLocalRecords()

    // 按日期和类型筛选
    records = records.filter(r =>
      r.date >= startDate && r.date <= endDate && r.type === type
    )

    const total = records.reduce((sum, r) => sum + r.amount, 0)

    // 分组统计
    let groups = []
    if (groupBy === 'category') {
      const categoryMap = {}
      records.forEach(r => {
        if (!categoryMap[r.category]) {
          categoryMap[r.category] = { name: r.category, amount: 0, count: 0 }
        }
        categoryMap[r.category].amount += r.amount
        categoryMap[r.category].count += 1
      })
      groups = Object.values(categoryMap)
        .map(g => ({
          ...g,
          percent: total > 0 ? Math.round((g.amount / total) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount)
    } else if (groupBy === 'day') {
      const dayMap = {}
      records.forEach(r => {
        if (!dayMap[r.date]) {
          dayMap[r.date] = { name: r.date, amount: 0, count: 0 }
        }
        dayMap[r.date].amount += r.amount
        dayMap[r.date].count += 1
      })
      groups = Object.values(dayMap)
        .map(g => ({
          ...g,
          percent: total > 0 ? Math.round((g.amount / total) * 100) : 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } else if (groupBy === 'month') {
      const monthMap = {}
      records.forEach(r => {
        const month = r.date.substring(0, 7)
        if (!monthMap[month]) {
          monthMap[month] = { name: month, amount: 0, count: 0 }
        }
        monthMap[month].amount += r.amount
        monthMap[month].count += 1
      })
      groups = Object.values(monthMap)
        .map(g => ({
          ...g,
          percent: total > 0 ? Math.round((g.amount / total) * 100) : 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }

    // 预算信息
    let budget = null
    if (type === 'expense') {
      const budgets = getLocalBudgets()
      const month = getCurrentMonth()
      const totalBudget = budgets
        .filter(b => b.month === month)
        .reduce((sum, b) => sum + b.amount, 0)
      if (totalBudget > 0) {
        budget = {
          total: totalBudget,
          used: total,
          remaining: totalBudget - total
        }
      }
    }

    const structuredContent = {
      total,
      groups,
      budget,
      startDate,
      endDate,
      type,
      groupBy
    }

    const typeText = type === 'expense' ? '支出' : '收入'
    return successResult(
      `${startDate} ~ ${endDate} 总${typeText} ${fenToYuan(total)} 元，共 ${groups.length} 个分类`,
      structuredContent
    )
  }

  // 正式模式
  try {
    const result = await callCloud('getStatistics', {
      startDate,
      endDate,
      type,
      groupBy
    })

    if (result && result.code === 0 && result.data) {
      const typeText = type === 'expense' ? '支出' : '收入'
      return successResult(
        `${startDate} ~ ${endDate} 总${typeText} ${fenToYuan(result.data.total)} 元`,
        result.data
      )
    }
    return errorResult(result?.message || '统计失败')
  } catch (err) {
    console.error('[accounting-skill] getStatistics error:', err)
    return errorResult('获取统计数据失败，请稍后重试')
  }
}

module.exports = getStatistics
