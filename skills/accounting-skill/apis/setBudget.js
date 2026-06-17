/**
 * setBudget - 设置月度分类预算
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  yuanToFen,
  fenToYuan,
  getCurrentMonth,
  EXPENSE_CATEGORIES
} = require('../utils/util')
const { saveLocalBudget, getLocalRecords } = require('../utils/storage')

async function setBudget(params = {}) {
  const { category, amount, month } = params

  // 参数校验
  if (!category) {
    return errorResult('请指定预算分类（如：餐饮、交通，或 total 表示总预算）')
  }
  if (!amount || amount <= 0) {
    return errorResult('请提供有效的预算金额')
  }
  if (category !== 'total' && !EXPENSE_CATEGORIES.includes(category)) {
    return errorResult(`不支持的分类：${category}，可选：total（总预算）、${EXPENSE_CATEGORIES.join('、')}`)
  }

  const budgetMonth = month || getCurrentMonth()
  const amountFen = yuanToFen(amount)

  // 预览模式
  if (isPreviewMode()) {
    const budgetId = `bgt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const budget = {
      budgetId,
      category,
      amount: amountFen,
      month: budgetMonth,
      createdAt: Date.now()
    }

    saveLocalBudget(budget)

    // 计算已使用金额
    const records = getLocalRecords()
    let used = 0
    if (category === 'total') {
      used = records
        .filter(r => r.type === 'expense' && r.date.startsWith(budgetMonth))
        .reduce((sum, r) => sum + r.amount, 0)
    } else {
      used = records
        .filter(r => r.type === 'expense' && r.category === category && r.date.startsWith(budgetMonth))
        .reduce((sum, r) => sum + r.amount, 0)
    }

    const structuredContent = {
      budgetId,
      category,
      amount: amountFen,
      month: budgetMonth,
      used,
      remaining: amountFen - used
    }

    const categoryText = category === 'total' ? '总' : category
    return successResult(
      `已设置 ${budgetMonth} ${categoryText}预算 ${fenToYuan(amountFen)} 元，已使用 ${fenToYuan(used)} 元，剩余 ${fenToYuan(amountFen - used)} 元`,
      structuredContent
    )
  }

  // 正式模式
  try {
    const result = await callCloud('setBudget', {
      category,
      amount: amountFen,
      month: budgetMonth
    })

    if (result && result.code === 0 && result.data) {
      const { data } = result
      const categoryText = category === 'total' ? '总' : category
      return successResult(
        `已设置 ${budgetMonth} ${categoryText}预算 ${fenToYuan(data.amount)} 元`,
        data
      )
    }
    return errorResult(result?.message || '设置预算失败')
  } catch (err) {
    console.error('[accounting-skill] setBudget error:', err)
    return errorResult('设置预算失败，请稍后重试')
  }
}

module.exports = setBudget
