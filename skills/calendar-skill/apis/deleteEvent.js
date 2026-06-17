/**
 * deleteEvent - 删除日程
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  formatDateTime
} = require('../utils/util')
const { deleteLocalEvent, getLocalEventById } = require('../utils/storage')

async function deleteEvent(params = {}) {
  const { eventId } = params

  // 参数校验
  if (!eventId) {
    return errorResult('请提供要删除的日程 ID')
  }

  let deletedEvent = null

  if (isPreviewMode()) {
    // 预览模式：从本地存储删除
    deletedEvent = deleteLocalEvent(eventId)
    if (!deletedEvent) {
      return errorResult('未找到该日程，可能已被删除')
    }
  } else {
    // 正式模式：调用云函数
    const result = await callCloud('deleteEvent', { eventId })
    if (!result || !result.event) {
      return errorResult('未找到该日程，可能已被删除')
    }
    deletedEvent = result.event
  }

  const startDisplay = formatDateTime(deletedEvent.startTime)

  return successResult(
    `日程「${deletedEvent.title}」已删除`,
    {
      action: 'delete',
      eventId: deletedEvent.eventId,
      title: deletedEvent.title,
      category: deletedEvent.category,
      startDisplay: startDisplay.display,
      deletedEvent: {
        title: deletedEvent.title,
        category: deletedEvent.category,
        startTime: deletedEvent.startTime,
        location: deletedEvent.location || ''
      }
    }
  )
}

module.exports = deleteEvent
