/**
 * accounting-handler 云函数
 * 处理记账本所有后端逻辑
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 数据库集合
const RECORDS_COLLECTION = 'accounting_records'
const BUDGETS_COLLECTION = 'accounting_budgets'

/**
 * 获取当前用户 openid
 */
function getOpenid() {
  const wxContext = cloud.getWXContext()
  return wxContext.OPENID
}

/**
 * 获取今日日期
 */
function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 添加记账记录
 */
async function addRecord(event) {
  const openid = getOpenid()
  const { amount, type, category, note = '', date, time } = event

  if (!amount || amount <= 0) {
    return { code: -1, message: '无效的金额' }
  }

  const record = {
    _openid: openid,
    amount,
    type,
    category,
    note,
    date: date || getToday(),
    time: time || new Date().toTimeString().substring(0, 5),
    createdAt: Date.now()
  }

  const res = await db.collection(RECORDS_COLLECTION).add({ data: record })

  // 计算今日总支出
  const todayRecords = await db.collection(RECORDS_COLLECTION)
    .where({
      _openid: openid,
      type: 'expense',
      date: getToday()
    })
    .get()

  const todayTotal = todayRecords.data.reduce((sum, r) => sum + r.amount, 0)

  // 检查预算
  const month = record.date.substring(0, 7)
  let budgetInfo = null
  const budgetRes = await db.collection(BUDGETS_COLLECTION)
    .where({
      _openid: openid,
      category: category,
      month: month
    })
    .get()

  if (budgetRes.data.length > 0) {
    const budget = budgetRes.data[0]
    const categoryRecords = await db.collection(RECORDS_COLLECTION)
      .where({
        _openid: openid,
        type: 'expense',
        category: category,
        date: _.gte(month + '-01').and(_.lte(month + '-31'))
      })
      .get()
    const categoryUsed = categoryRecords.data.reduce((sum, r) => sum + r.amount, 0)
    budgetInfo = {
      budget: budget.amount,
      used: categoryUsed,
      remaining: budget.amount - categoryUsed
    }
  }

  return {
    code: 0,
    data: {
      recordId: res._id,
      amount,
      type,
      category,
      note,
      date: record.date,
      time: record.time,
      todayTotal,
      budgetInfo
    }
  }
}

/**
 * 查询记录列表
 */
async function getRecords(event) {
  const openid = getOpenid()
  const {
    startDate,
    endDate,
    type = 'all',
    category,
    page = 1,
    pageSize = 20
  } = event

  let query = db.collection(RECORDS_COLLECTION).where({
    _openid: openid,
    date: _.gte(startDate).and(_.lte(endDate))
  })

  if (type !== 'all') {
    query = db.collection(RECORDS_COLLECTION).where({
      _openid: openid,
      date: _.gte(startDate).and(_.lte(endDate)),
      type: type
    })
  }

  if (category) {
    query = db.collection(RECORDS_COLLECTION).where({
      _openid: openid,
      date: _.gte(startDate).and(_.lte(endDate)),
      category: category,
      ...(type !== 'all' ? { type } : {})
    })
  }

  // 获取总数
  const countRes = await query.count()
  const count = countRes.total

  // 分页查询
  const skip = (page - 1) * pageSize
  const recordsRes = await query
    .orderBy('date', 'desc')
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  const records = recordsRes.data.map(r => ({
    recordId: r._id,
    amount: r.amount,
    type: r.type,
    category: r.category,
    note: r.note,
    date: r.date,
    time: r.time
  }))

  // 计算期间总额
  const allRecordsRes = await db.collection(RECORDS_COLLECTION).where({
    _openid: openid,
    date: _.gte(startDate).and(_.lte(endDate))
  }).get()

  const totalExpense = allRecordsRes.data
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)
  const totalIncome = allRecordsRes.data
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)

  return {
    code: 0,
    data: {
      records,
      totalExpense,
      totalIncome,
      count,
      startDate,
      endDate,
      page,
      pageSize,
      hasMore: skip + pageSize < count
    }
  }
}

/**
 * 获取统计数据
 */
async function getStatistics(event) {
  const openid = getOpenid()
  const { startDate, endDate, type = 'expense', groupBy = 'category' } = event

  const recordsRes = await db.collection(RECORDS_COLLECTION).where({
    _openid: openid,
    date: _.gte(startDate).and(_.lte(endDate)),
    type: type
  }).get()

  const records = recordsRes.data
  const total = records.reduce((sum, r) => sum + r.amount, 0)

  // 分组统计
  let groups = []
  if (groupBy === 'category') {
    const map = {}
    records.forEach(r => {
      if (!map[r.category]) {
        map[r.category] = { name: r.category, amount: 0, count: 0 }
      }
      map[r.category].amount += r.amount
      map[r.category].count += 1
    })
    groups = Object.values(map)
      .map(g => ({ ...g, percent: total > 0 ? Math.round((g.amount / total) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount)
  } else if (groupBy === 'day') {
    const map = {}
    records.forEach(r => {
      if (!map[r.date]) {
        map[r.date] = { name: r.date, amount: 0, count: 0 }
      }
      map[r.date].amount += r.amount
      map[r.date].count += 1
    })
    groups = Object.values(map)
      .map(g => ({ ...g, percent: total > 0 ? Math.round((g.amount / total) * 100) : 0 }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } else if (groupBy === 'month') {
    const map = {}
    records.forEach(r => {
      const month = r.date.substring(0, 7)
      if (!map[month]) {
        map[month] = { name: month, amount: 0, count: 0 }
      }
      map[month].amount += r.amount
      map[month].count += 1
    })
    groups = Object.values(map)
      .map(g => ({ ...g, percent: total > 0 ? Math.round((g.amount / total) * 100) : 0 }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  // 获取预算
  let budget = null
  if (type === 'expense') {
    const month = startDate.substring(0, 7)
    const budgetsRes = await db.collection(BUDGETS_COLLECTION).where({
      _openid: openid,
      month: month
    }).get()
    const totalBudget = budgetsRes.data.reduce((sum, b) => sum + b.amount, 0)
    if (totalBudget > 0) {
      budget = { total: totalBudget, used: total, remaining: totalBudget - total }
    }
  }

  return {
    code: 0,
    data: { total, groups, budget, startDate, endDate, type, groupBy }
  }
}

/**
 * 删除记录
 */
async function deleteRecord(event) {
  const openid = getOpenid()
  const { recordId } = event

  if (!recordId) {
    return { code: -1, message: '缺少 recordId' }
  }

  // 查询记录确认归属
  const recordRes = await db.collection(RECORDS_COLLECTION)
    .where({ _id: recordId, _openid: openid })
    .get()

  if (recordRes.data.length === 0) {
    return { code: -1, message: '记录不存在或无权限删除' }
  }

  const record = recordRes.data[0]

  await db.collection(RECORDS_COLLECTION)
    .where({ _id: recordId, _openid: openid })
    .remove()

  return {
    code: 0,
    data: {
      success: true,
      deletedRecord: {
        recordId: record._id,
        amount: record.amount,
        type: record.type,
        category: record.category,
        note: record.note,
        date: record.date
      }
    }
  }
}

/**
 * 设置预算
 */
async function setBudget(event) {
  const openid = getOpenid()
  const { category, amount, month } = event

  if (!category || !amount || amount <= 0) {
    return { code: -1, message: '参数无效' }
  }

  // 查询是否已有该分类预算
  const existing = await db.collection(BUDGETS_COLLECTION).where({
    _openid: openid,
    category: category,
    month: month
  }).get()

  let budgetId
  if (existing.data.length > 0) {
    // 更新
    budgetId = existing.data[0]._id
    await db.collection(BUDGETS_COLLECTION)
      .where({ _id: budgetId, _openid: openid })
      .update({ data: { amount, createdAt: Date.now() } })
  } else {
    // 新建
    const res = await db.collection(BUDGETS_COLLECTION).add({
      data: {
        _openid: openid,
        category,
        amount,
        month,
        createdAt: Date.now()
      }
    })
    budgetId = res._id
  }

  // 计算已使用金额
  const condition = category === 'total'
    ? { _openid: openid, type: 'expense', date: _.gte(month + '-01').and(_.lte(month + '-31')) }
    : { _openid: openid, type: 'expense', category, date: _.gte(month + '-01').and(_.lte(month + '-31')) }

  const usedRes = await db.collection(RECORDS_COLLECTION).where(condition).get()
  const used = usedRes.data.reduce((sum, r) => sum + r.amount, 0)

  return {
    code: 0,
    data: {
      budgetId,
      category,
      amount,
      month,
      used,
      remaining: amount - used
    }
  }
}

/**
 * 云函数入口
 */
exports.main = async (event) => {
  const { action } = event

  try {
    switch (action) {
      case 'addRecord':
        return await addRecord(event)
      case 'getRecords':
        return await getRecords(event)
      case 'getStatistics':
        return await getStatistics(event)
      case 'deleteRecord':
        return await deleteRecord(event)
      case 'setBudget':
        return await setBudget(event)
      default:
        return { code: -1, message: `未知 action: ${action}` }
    }
  } catch (err) {
    console.error(`[accounting-handler] ${action} error:`, err)
    return { code: -1, message: err.message || '服务端错误' }
  }
}
