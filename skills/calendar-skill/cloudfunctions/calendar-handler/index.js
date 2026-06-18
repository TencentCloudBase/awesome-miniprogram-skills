/**
 * calendar-handler 云函数
 * 
 * 功能：
 * 1. 日程 CRUD（addEvent / getEvents / getEventById / updateEvent / deleteEvent）
 * 2. 订阅提醒设置（subscribeReminder）
 * 3. 定时触发器：扫描即将到期的日程，通过订阅消息推送提醒
 * 
 * 数据库集合：calendar_events
 * 
 * 订阅消息推送使用云开发能力：cloud.openapi.subscribeMessage.send
 */

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const COLLECTION = 'calendar_events'

// ========== 主入口 ==========
exports.main = async (event, context) => {
  console.log('[calendar-handler] event:', JSON.stringify(event))

  // 定时触发器入口（必须在解构之前判断）
  if (event.Type === 'timer' || event.Type === 'Timer') {
    return await handleTimerTrigger()
  }

  const { action, ...params } = event
  const { OPENID } = cloud.getWXContext()

  // 常规 API 路由
  switch (action) {
    case 'addEvent':
      return await addEvent(OPENID, params)
    case 'getEvents':
      return await getEvents(OPENID, params)
    case 'getEventById':
      return await getEventById(OPENID, params)
    case 'updateEvent':
      return await updateEvent(OPENID, params)
    case 'deleteEvent':
      return await deleteEvent(OPENID, params)
    case 'subscribeReminder':
      return await subscribeReminder(OPENID, params)
    default:
      return { errCode: -1, errMsg: `未知操作: ${action}` }
  }
}

// ========== 创建日程 ==========
async function addEvent(openid, params) {
  const { event } = params

  const doc = {
    ...event,
    _openid: openid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const result = await db.collection(COLLECTION).add({ data: doc })

  return {
    eventId: result._id,
    success: true
  }
}

// ========== 查询日程列表 ==========
async function getEvents(openid, params) {
  const { startDate, endDate, category, page = 1, pageSize = 20 } = params

  let query = db.collection(COLLECTION).where({
    _openid: openid,
    status: 'active'
  })

  // 时间范围过滤
  if (startDate && endDate) {
    query = query.where({
      _openid: openid,
      status: 'active',
      startTime: _.gte(startDate + 'T00:00:00.000Z').and(_.lte(endDate + 'T23:59:59.999Z'))
    })
  } else if (startDate) {
    query = query.where({
      _openid: openid,
      status: 'active',
      startTime: _.gte(startDate + 'T00:00:00.000Z')
    })
  }

  // 分类过滤
  if (category) {
    query = db.collection(COLLECTION).where({
      _openid: openid,
      status: 'active',
      category: category,
      ...(startDate ? { startTime: _.gte(startDate + 'T00:00:00.000Z') } : {}),
      ...(endDate ? { startTime: _.lte(endDate + 'T23:59:59.999Z') } : {})
    })
  }

  // 获取总数
  const countResult = await query.count()
  const total = countResult.total

  // 分页查询
  const skip = (page - 1) * pageSize
  const result = await query
    .orderBy('startTime', 'asc')
    .skip(skip)
    .limit(pageSize)
    .get()

  return {
    events: result.data.map(doc => ({
      eventId: doc._id,
      title: doc.title,
      description: doc.description || '',
      category: doc.category,
      location: doc.location || '',
      startTime: doc.startTime,
      endTime: doc.endTime,
      allDay: doc.allDay || false,
      remindBefore: doc.remindBefore || 15,
      subscribed: doc.subscribed || false,
      reminded: doc.reminded || false,
      status: doc.status
    })),
    total
  }
}

// ========== 获取单个日程 ==========
async function getEventById(openid, params) {
  const { eventId } = params

  const result = await db.collection(COLLECTION).doc(eventId).get()
  const doc = result.data

  if (!doc || doc._openid !== openid) {
    return { event: null }
  }

  return {
    event: {
      eventId: doc._id,
      title: doc.title,
      description: doc.description || '',
      category: doc.category,
      location: doc.location || '',
      startTime: doc.startTime,
      endTime: doc.endTime,
      allDay: doc.allDay || false,
      remindBefore: doc.remindBefore || 15,
      subscribed: doc.subscribed || false,
      reminded: doc.reminded || false,
      status: doc.status
    }
  }
}

// ========== 修改日程 ==========
async function updateEvent(openid, params) {
  const { eventId, updates } = params

  // 验证所属
  const existing = await db.collection(COLLECTION).doc(eventId).get()
  if (!existing.data || existing.data._openid !== openid) {
    return { event: null }
  }

  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString()
  }

  await db.collection(COLLECTION).doc(eventId).update({ data: updateData })

  // 返回更新后的完整数据
  const updatedResult = await db.collection(COLLECTION).doc(eventId).get()
  const doc = updatedResult.data

  return {
    event: {
      eventId: doc._id,
      title: doc.title,
      description: doc.description || '',
      category: doc.category,
      location: doc.location || '',
      startTime: doc.startTime,
      endTime: doc.endTime,
      allDay: doc.allDay || false,
      remindBefore: doc.remindBefore || 15,
      subscribed: doc.subscribed || false,
      reminded: doc.reminded || false,
      status: doc.status
    }
  }
}

// ========== 删除日程 ==========
async function deleteEvent(openid, params) {
  const { eventId } = params

  // 获取日程信息
  const existing = await db.collection(COLLECTION).doc(eventId).get()
  if (!existing.data || existing.data._openid !== openid) {
    return { event: null }
  }

  const doc = existing.data

  // 软删除（修改状态）
  await db.collection(COLLECTION).doc(eventId).update({
    data: {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    }
  })

  return {
    event: {
      eventId: doc._id,
      title: doc.title,
      category: doc.category,
      location: doc.location || '',
      startTime: doc.startTime,
      endTime: doc.endTime
    }
  }
}

// ========== 订阅提醒 ==========
async function subscribeReminder(openid, params) {
  const { eventId, remindBefore = 15, subscribed = true } = params

  await db.collection(COLLECTION).doc(eventId).update({
    data: {
      subscribed: subscribed,
      remindBefore: remindBefore,
      reminded: false,
      updatedAt: new Date().toISOString()
    }
  })

  return { success: true, subscribed }
}

// ========== 定时触发器：扫描并发送提醒 ==========
async function handleTimerTrigger() {
  const now = new Date()
  console.log('[calendar-handler] Timer triggered at:', now.toISOString())

  // 查找所有已订阅、未提醒、且在提醒窗口内的日程
  // 查询所有需要提醒的日程（未提醒 + 已订阅 + 活跃状态）
  const result = await db.collection(COLLECTION).where({
    status: 'active',
    subscribed: true,
    reminded: false
  }).limit(100).get()

  const remindedEvents = []

  for (const doc of result.data) {
    const remindBefore = doc.remindBefore || 15
    const eventStart = new Date(doc.startTime)
    const remindTime = new Date(eventStart.getTime() - remindBefore * 60 * 1000)

    // 提醒时间已到且日程尚未开始 → 发送提醒
    if (remindTime <= now && eventStart > now) {
      try {
        await sendSubscribeMessage(doc)
        await db.collection(COLLECTION).doc(doc._id).update({
          data: { reminded: true, updatedAt: new Date().toISOString() }
        })
        remindedEvents.push(doc._id)
        console.log('[calendar-handler] Reminded event:', doc._id, doc.title)
      } catch (err) {
        console.error('[calendar-handler] Send message failed:', doc._id, err)
      }
    }
    // 日程已开始但未提醒 → 标记已提醒（避免下次重复扫描）
    else if (eventStart <= now) {
      await db.collection(COLLECTION).doc(doc._id).update({
        data: { reminded: true, updatedAt: new Date().toISOString() }
      })
    }
  }

  return {
    triggered: remindedEvents.length,
    eventIds: remindedEvents
  }
}

// ========== 发送订阅消息 ==========
async function sendSubscribeMessage(eventDoc) {
  const openid = eventDoc._openid

  // 格式化时间（云函数环境为 UTC，需转换为 UTC+8）
  const startDate = new Date(eventDoc.startTime)
  const cnDate = new Date(startDate.getTime() + 8 * 60 * 60 * 1000)
  const timeStr = `${cnDate.getUTCFullYear()}-${String(cnDate.getUTCMonth() + 1).padStart(2, '0')}-${String(cnDate.getUTCDate()).padStart(2, '0')} ${String(cnDate.getUTCHours()).padStart(2, '0')}:${String(cnDate.getUTCMinutes()).padStart(2, '0')}`

  // 模板 ID 从日程记录中获取（订阅时已存入）
  // 模板编号: 30746 - 预约通知
  // thing20 - 预约内容（填入日程标题）
  // time3   - 预约时间（填入日程时间）
  // thing6  - 备注（填入日程地点/描述）
  const templateId = eventDoc.templateId
  if (!templateId) {
    console.warn('[calendar-handler] No templateId in event:', eventDoc._id)
    return
  }

  // 定时触发器和小程序端均可直接使用 cloud.openapi
  const result = await cloud.openapi.subscribeMessage.send({
    touser: openid,
    templateId,
    page: '/pages/home/home',
    data: {
      thing20: {
        value: (eventDoc.title || '日程提醒').slice(0, 20) // 限制20字
      },
      time3: {
        value: timeStr
      },
      thing6: {
        value: (eventDoc.location || eventDoc.category || '日程提醒').slice(0, 20)
      }
    }
  })

  if (result.errCode !== 0) {
    throw new Error(`订阅消息发送失败: ${result.errMsg}`)
  }

  return result
}
