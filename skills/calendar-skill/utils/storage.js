/**
 * calendar-skill 本地存储管理（预览模式使用）
 */
const { toLocalISOString } = require('./util')

const STORAGE_PREFIX = 'mp_skills_calendar_'

function getKey(suffix) {
  return `${STORAGE_PREFIX}${suffix}`
}

// ========== 日程 ==========

function getLocalEvents() {
  return wx.getStorageSync(getKey('events')) || []
}

function saveLocalEvents(events) {
  wx.setStorageSync(getKey('events'), events)
}

function addLocalEvent(event) {
  const events = getLocalEvents()
  events.unshift(event)
  saveLocalEvents(events)
  return event
}

function updateLocalEvent(eventId, updates) {
  const events = getLocalEvents()
  const idx = events.findIndex(e => e.eventId === eventId)
  if (idx === -1) return null
  events[idx] = { ...events[idx], ...updates, updatedAt: toLocalISOString(new Date()) }
  saveLocalEvents(events)
  return events[idx]
}

function deleteLocalEvent(eventId) {
  const events = getLocalEvents()
  const idx = events.findIndex(e => e.eventId === eventId)
  if (idx === -1) return null
  const [deleted] = events.splice(idx, 1)
  saveLocalEvents(events)
  return deleted
}

function getLocalEventById(eventId) {
  const events = getLocalEvents()
  return events.find(e => e.eventId === eventId) || null
}

/**
 * 按时间范围查询日程
 */
function queryLocalEvents({ startDate, endDate, category, status = 'active' }) {
  let events = getLocalEvents()

  // 状态过滤
  if (status) {
    events = events.filter(e => e.status === status)
  }

  // 时间范围过滤
  if (startDate) {
    events = events.filter(e => {
      const eventDate = e.startTime.slice(0, 10)
      return eventDate >= startDate
    })
  }
  if (endDate) {
    events = events.filter(e => {
      const eventDate = e.startTime.slice(0, 10)
      return eventDate <= endDate
    })
  }

  // 分类过滤
  if (category) {
    events = events.filter(e => e.category === category)
  }

  // 按开始时间排序
  events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  return events
}

// ========== 订阅状态 ==========

function getLocalSubscribeCount() {
  return wx.getStorageSync(getKey('subscribe_count')) || 0
}

function setLocalSubscribeCount(count) {
  wx.setStorageSync(getKey('subscribe_count'), count)
}

function incrementSubscribeCount() {
  const count = getLocalSubscribeCount() + 1
  setLocalSubscribeCount(count)
  return count
}

module.exports = {
  getLocalEvents,
  saveLocalEvents,
  addLocalEvent,
  updateLocalEvent,
  deleteLocalEvent,
  getLocalEventById,
  queryLocalEvents,
  getLocalSubscribeCount,
  setLocalSubscribeCount,
  incrementSubscribeCount
}
