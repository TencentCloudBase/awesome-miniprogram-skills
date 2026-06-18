/**
 * updateEvent - 修改日程
 * 支持修改标题、时间、地点、分类、提醒等
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  formatDateTime,
  getRemindText,
  EVENT_CATEGORIES
} = require('../utils/util')
const { updateLocalEvent, getLocalEventById } = require('../utils/storage')

async function updateEvent(params = {}) {
  const { eventId, title, startTime, endTime, category, location, description, remindBefore, allDay } = params

  // 参数校验
  if (!eventId) {
    return errorResult('请提供要修改的日程 ID')
  }

  // 检查分类合法性
  if (category && !EVENT_CATEGORIES.includes(category)) {
    return errorResult(`不支持的日程分类：${category}，可选：${EVENT_CATEGORIES.join('、')}`)
  }

  // 构建更新对象（只包含传入的字段）
  const updates = {}
  if (title !== undefined) updates.title = title
  if (startTime !== undefined) updates.startTime = startTime
  if (endTime !== undefined) updates.endTime = endTime
  if (category !== undefined) updates.category = category
  if (location !== undefined) updates.location = location
  if (description !== undefined) updates.description = description
  if (remindBefore !== undefined) updates.remindBefore = remindBefore
  if (allDay !== undefined) updates.allDay = allDay

  if (Object.keys(updates).length === 0) {
    return errorResult('请提供需要修改的内容')
  }

  let updatedEvent = null

  if (isPreviewMode()) {
    // 预览模式：修改本地存储
    updatedEvent = updateLocalEvent(eventId, updates)
    if (!updatedEvent) {
      return errorResult('未找到该日程，可能已被删除')
    }
  } else {
    // 正式模式：调用云函数
    const result = await callCloud('updateEvent', { eventId, updates })
    if (!result || !result.event) {
      return errorResult('未找到该日程，可能已被删除')
    }
    updatedEvent = result.event
  }

  // 格式化显示
  const startDisplay = formatDateTime(updatedEvent.startTime)
  const endDisplay = formatDateTime(updatedEvent.endTime)

  return successResult(
    `日程「${updatedEvent.title}」已更新`,
    {
      action: 'update',
      eventId: updatedEvent.eventId,
      title: updatedEvent.title,
      category: updatedEvent.category,
      location: updatedEvent.location || '',
      startTime: updatedEvent.startTime,
      endTime: updatedEvent.endTime,
      startDisplay: startDisplay.display,
      endDisplay: endDisplay.display,
      allDay: updatedEvent.allDay || false,
      remindBefore: updatedEvent.remindBefore,
      remindText: getRemindText(updatedEvent.remindBefore),
      subscribed: updatedEvent.subscribed || false
    }
  )
}

module.exports = updateEvent
