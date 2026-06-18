/**
 * accounting-skill 本地存储管理（预览模式使用）
 */

const STORAGE_PREFIX = 'mp_skills_accounting_'

/**
 * 获取存储 key
 */
function getKey(suffix) {
  return `${STORAGE_PREFIX}${suffix}`
}

/**
 * 获取所有本地记录
 */
function getLocalRecords() {
  return wx.getStorageSync(getKey('records')) || []
}

/**
 * 保存记录到本地
 */
function saveLocalRecords(records) {
  wx.setStorageSync(getKey('records'), records)
}

/**
 * 添加一条记录
 */
function addLocalRecord(record) {
  const records = getLocalRecords()
  records.unshift(record)
  saveLocalRecords(records)
  return record
}

/**
 * 删除一条记录
 */
function deleteLocalRecord(recordId) {
  const records = getLocalRecords()
  const idx = records.findIndex(r => r.recordId === recordId)
  if (idx === -1) return null
  const [deleted] = records.splice(idx, 1)
  saveLocalRecords(records)
  return deleted
}

/**
 * 获取本地预算
 */
function getLocalBudgets() {
  return wx.getStorageSync(getKey('budgets')) || []
}

/**
 * 保存预算
 */
function saveLocalBudget(budget) {
  const budgets = getLocalBudgets()
  const idx = budgets.findIndex(b => b.category === budget.category && b.month === budget.month)
  if (idx >= 0) {
    budgets[idx] = budget
  } else {
    budgets.push(budget)
  }
  wx.setStorageSync(getKey('budgets'), budgets)
  return budget
}

module.exports = {
  getLocalRecords,
  saveLocalRecords,
  addLocalRecord,
  deleteLocalRecord,
  getLocalBudgets,
  saveLocalBudget
}
