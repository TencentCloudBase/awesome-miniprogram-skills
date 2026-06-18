/**
 * getRecords - 查询账单记录列表
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  fenToYuan,
  getToday,
  getMonthStart
} = require('../utils/util')
const { getLocalRecords } = require('../utils/storage')

async function getRecords(params = {}) {
  const {
    startDate = getMonthStart(),
    endDate = getToday(),
    type = 'all',
    category,
    page = 1,
    pageSize = 20
  } = params

  // 预览模式
  if (isPreviewMode()) {
    let records = getLocalRecords()

    // 按日期筛选
    records = records.filter(r => r.date >= startDate && r.date <= endDate)

    // 按类型筛选
    if (type !== 'all') {
      records = records.filter(r => r.type === type)
    }

    // 按分类筛选
    if (category) {
      records = records.filter(r => r.category === category)
    }

    // 计算总额
    const totalExpense = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
    const totalIncome = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)

    const count = records.length

    // 分页
    const start = (page - 1) * pageSize
    const pagedRecords = records.slice(start, start + pageSize)

    const structuredContent = {
      records: pagedRecords,
      totalExpense,
      totalIncome,
      count,
      startDate,
      endDate,
      page,
      pageSize,
      hasMore: start + pageSize < count
    }

    const dateRange = startDate === endDate
      ? startDate
      : `${startDate} ~ ${endDate}`

    return successResult(
      `${dateRange} 共 ${count} 笔记录，支出 ${fenToYuan(totalExpense)} 元，收入 ${fenToYuan(totalIncome)} 元`,
      structuredContent
    )
  }

  // 正式模式：调用云函数
  try {
    const result = await callCloud('getRecords', {
      startDate,
      endDate,
      type,
      category,
      page,
      pageSize
    })

    if (result && result.code === 0 && result.data) {
      const { totalExpense, totalIncome, count } = result.data
      const dateRange = startDate === endDate
        ? startDate
        : `${startDate} ~ ${endDate}`
      return successResult(
        `${dateRange} 共 ${count} 笔记录，支出 ${fenToYuan(totalExpense)} 元，收入 ${fenToYuan(totalIncome)} 元`,
        result.data
      )
    }
    return errorResult(result?.message || '查询失败')
  } catch (err) {
    console.error('[accounting-skill] getRecords error:', err)
    return errorResult('查询账单失败，请稍后重试')
  }
}

module.exports = getRecords
