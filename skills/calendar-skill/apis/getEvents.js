/**
 * getEvents - 查询日程列表
 * 支持按日期范围、分类筛选
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  getToday,
  formatDateTime
} = require('../utils/util')
const { queryLocalEvents } = require('../utils/storage')

async function getEvents(params = {}) {
  const {
    startDate,
    endDate,
    category,
    page = 1,
    pageSize = 20
  } = params

  // 默认查询：今天到未来7天
  const actualStartDate = startDate || getToday()
  const actualEndDate = endDate || (() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()

  let events = []
  let total = 0

  if (isPreviewMode()) {
    // 预览模式：从本地存储查询
    const allEvents = queryLocalEvents({
      startDate: actualStartDate,
      endDate: actualEndDate,
      category,
      status: 'active'
    })
    total = allEvents.length
    const start = (page - 1) * pageSize
    events = allEvents.slice(start, start + pageSize)
  } else {
    // 正式模式：调用云函数
    const result = await callCloud('getEvents', {
      startDate: actualStartDate,
      endDate: actualEndDate,
      category,
      page,
      pageSize
    })
    events = result.events || []
    total = result.total || 0
  }

  // 格式化每条日程的显示时间
  const formattedEvents = events.map(event => {
    const startInfo = formatDateTime(event.startTime)
    const endInfo = formatDateTime(event.endTime)
    return {
      ...event,
      startDisplay: startInfo.display,
      endDisplay: endInfo.display,
      startDate: startInfo.date,
      startTimeStr: startInfo.time
    }
  })

  const hasMore = total > page * pageSize

  // 生成描述
  let msg = ''
  if (total === 0) {
    msg = `${actualStartDate} 至 ${actualEndDate} 暂无日程安排`
  } else {
    msg = `${actualStartDate} 至 ${actualEndDate} 共有 ${total} 个日程`
  }

  return successResult(msg, {
    events: formattedEvents,
    total,
    startDate: actualStartDate,
    endDate: actualEndDate,
    hasMore,
    page,
    pageSize
  })
}

module.exports = getEvents
