/**
 * addRecord - 记录一笔收入或支出
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  yuanToFen,
  fenToYuan,
  getToday,
  getNow,
  getCurrentMonth,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES
} = require('../utils/util')
const { addLocalRecord, getLocalRecords, getLocalBudgets } = require('../utils/storage')

async function addRecord(params = {}) {
  const { amount, type = 'expense', category, note = '', date, time } = params

  // 参数校验
  if (!amount || amount <= 0) {
    return errorResult('请提供有效的金额')
  }
  if (!category) {
    return errorResult('请提供分类信息')
  }
  if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category)) {
    return errorResult(`不支持的支出分类：${category}，可选：${EXPENSE_CATEGORIES.join('、')}`)
  }
  if (type === 'income' && !INCOME_CATEGORIES.includes(category)) {
    return errorResult(`不支持的收入分类：${category}，可选：${INCOME_CATEGORIES.join('、')}`)
  }

  const recordDate = date || getToday()
  const recordTime = time || getNow()
  const amountFen = yuanToFen(amount)

  // 预览模式
  if (isPreviewMode()) {
    const recordId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const record = {
      recordId,
      amount: amountFen,
      type,
      category,
      note,
      date: recordDate,
      time: recordTime,
      createdAt: Date.now()
    }

    addLocalRecord(record)

    // 计算今日总支出
    const allRecords = getLocalRecords()
    const todayTotal = allRecords
      .filter(r => r.date === getToday() && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)

    // 检查预算
    const budgets = getLocalBudgets()
    const month = getCurrentMonth()
    const categoryBudget = budgets.find(b => b.category === category && b.month === month)
    let budgetInfo = null
    if (categoryBudget) {
      const categoryUsed = allRecords
        .filter(r => r.category === category && r.type === 'expense' && r.date.startsWith(month))
        .reduce((sum, r) => sum + r.amount, 0)
      budgetInfo = {
        budget: categoryBudget.amount,
        used: categoryUsed,
        remaining: categoryBudget.amount - categoryUsed
      }
    }

    const structuredContent = {
      recordId,
      amount: amountFen,
      type,
      category,
      note,
      date: recordDate,
      time: recordTime,
      todayTotal,
      budgetInfo,
      action: 'add'
    }

    const typeText = type === 'expense' ? '支出' : '收入'
    return successResult(
      `已记录${typeText} ${fenToYuan(amountFen)} 元（${category}）`,
      structuredContent
    )
  }

  // 正式模式：调用云函数
  try {
    const result = await callCloud('addRecord', {
      amount: amountFen,
      type,
      category,
      note,
      date: recordDate,
      time: recordTime
    })

    if (result && result.code === 0 && result.data) {
      const typeText = type === 'expense' ? '支出' : '收入'
      return successResult(
        `已记录${typeText} ${fenToYuan(amountFen)} 元（${category}）`,
        { ...result.data, action: 'add' }
      )
    }
    return errorResult(result?.message || '记账失败')
  } catch (err) {
    console.error('[accounting-skill] addRecord error:', err)
    return errorResult('记账失败，请稍后重试')
  }
}

module.exports = addRecord
