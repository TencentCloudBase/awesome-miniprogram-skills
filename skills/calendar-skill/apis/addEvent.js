/**
 * addEvent - 创建日程
 * AI 从自然语言中解析出时间、地点、标题等信息
 */
const config = require('../config')
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  generateId,
  getNowISO,
  getDefaultEndTime,
  formatDateTime,
  getRemindText,
  EVENT_CATEGORIES,
  DEFAULT_REMIND_BEFORE
} = require('../utils/util')
const { addLocalEvent } = require('../utils/storage')

async function addEvent(params = {}) {
  const {
    title,
    startTime,
    endTime,
    category = '其他',
    location = '',
    description = '',
    allDay = false,
    remindBefore = DEFAULT_REMIND_BEFORE
  } = params

  // 参数校验
  if (!title) {
    return errorResult('请提供日程标题或描述')
  }
  if (!startTime) {
    return errorResult('请提供日程开始时间')
  }
  if (!EVENT_CATEGORIES.includes(category)) {
    return errorResult(`不支持的日程分类：${category}，可选：${EVENT_CATEGORIES.join('、')}`)
  }

  // 构建日程对象
  const eventId = generateId()
  const now = getNowISO()
  const actualEndTime = endTime || getDefaultEndTime(startTime)

  const event = {
    eventId,
    title,
    description,
    category,
    location,
    startTime,
    endTime: actualEndTime,
    allDay,
    remindBefore,
    templateId: config.subscribeTemplateId || '',
    subscribed: false,
    reminded: false,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }

  if (isPreviewMode()) {
    // 预览模式：本地存储
    addLocalEvent(event)
  } else {
    // 正式模式：调用云函数
    const result = await callCloud('addEvent', { event })
    if (result && result.eventId) {
      event.eventId = result.eventId
    }
  }

  // 格式化显示时间
  const startDisplay = formatDateTime(startTime)
  const endDisplay = formatDateTime(actualEndTime)

  return successResult(
    `已创建日程「${title}」，时间：${startDisplay.display}`,
    {
      action: 'add',
      eventId: event.eventId,
      title,
      category,
      location,
      startTime,
      endTime: actualEndTime,
      startDisplay: startDisplay.display,
      endDisplay: endDisplay.display,
      allDay,
      remindBefore,
      remindText: getRemindText(remindBefore),
      subscribed: false
    }
  )
}

module.exports = addEvent
