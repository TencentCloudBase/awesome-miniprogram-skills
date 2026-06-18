/**
 * calendar-skill 工具函数
 */
const config = require('../config')

// 预览模式开关 key（所有 Skill 统一）
const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

// 日程分类
const EVENT_CATEGORIES = ['会议', '工作', '学习', '运动', '社交', '就医', '出行', '生日', '其他']

// 默认提醒提前分钟数
const DEFAULT_REMIND_BEFORE = 15

/**
 * 判断是否为预览模式
 */
function isPreviewMode() {
  if (!config.envId) {
    return true
  }
  try {
    return wx.getStorageSync(PREVIEW_MODE_KEY) === true
  } catch (e) {
    return true
  }
}

/**
 * 调用云函数（普通云函数，使用 callFunction）
 * 带超时保护，避免云环境未初始化时永久挂起
 */
async function callCloud(action, data = {}) {
  const fnName = config.functionName

  if (!wx.cloud) {
    throw new Error('云开发环境未初始化，请先调用 wx.cloud.init()')
  }

  const timeout = config.timeout || 15000

  const callPromise = new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: fnName,
      data: { action, ...data },
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`云函数调用超时（${timeout}ms），请检查云函数 ${fnName} 是否已部署`))
    }, timeout)
  })

  const res = await Promise.race([callPromise, timeoutPromise])
  return res.result
}

/**
 * 成功返回格式
 */
function successResult(msg, structuredContent, meta) {
  const result = {
    isError: false,
    content: [{ type: 'text', text: msg }],
    structuredContent: structuredContent || {}
  }
  if (meta) {
    result._meta = meta
  }
  return result
}

/**
 * 错误返回格式
 */
function errorResult(msg) {
  return {
    isError: true,
    content: [{ type: 'text', text: msg || '操作失败，请稍后重试' }]
  }
}

/**
 * 获取今天日期 YYYY-MM-DD
 */
function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 获取当前时间 HH:mm
 */
function getNow() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * 获取当前本地时间的 ISO 8601 字符串（带时区偏移）
 * 例如：2026-06-17T14:30:00+08:00
 */
function getNowISO() {
  return toLocalISOString(new Date())
}

/**
 * 将 Date 对象转为本地时区的 ISO 8601 字符串
 * 输出格式：YYYY-MM-DDTHH:mm:ss+HH:MM
 */
function toLocalISOString(date) {
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const absOffset = Math.abs(offset)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const minutes = String(absOffset % 60).padStart(2, '0')
  const tz = `${sign}${hours}:${minutes}`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${h}:${m}:${s}${tz}`
}

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

/**
 * 解析时间字符串为本地 Date 对象
 * 支持格式：
 * - ISO 8601 带时区：2026-06-18T14:00:00+08:00
 * - ISO 8601 UTC：2026-06-18T06:00:00.000Z
 * - 不带时区（视为本地时间）：2026-06-18T14:00:00 或 2026-06-18 14:00
 */
function parseLocalTime(timeStr) {
  if (!timeStr) return null
  // 如果带 Z 或 +/- 时区标记，直接用 Date 解析（会自动转本地）
  if (/[Zz]$/.test(timeStr) || /[+-]\d{2}:\d{2}$/.test(timeStr)) {
    return new Date(timeStr)
  }
  // 不带时区标记，视为本地时间直接解析
  // "2026-06-18T14:00:00" 或 "2026-06-18 14:00"
  const normalized = timeStr.replace(' ', 'T')
  const parts = normalized.split('T')
  const dateParts = parts[0].split('-').map(Number)
  const timeParts = (parts[1] || '00:00:00').split(':').map(Number)
  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0)
}

/**
 * 格式化日期时间为友好显示
 * @param {string} isoString - 时间字符串（支持多种格式）
 * @returns {object} { date, time, display }
 */
function formatDateTime(isoString) {
  if (!isoString) return { date: '', time: '', display: '' }
  const d = parseLocalTime(isoString)
  if (!d || isNaN(d.getTime())) return { date: '', time: '', display: '' }

  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  // 友好显示
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

  let display = ''
  if (date === todayStr) {
    display = `今天 ${time}`
  } else if (date === tomorrowStr) {
    display = `明天 ${time}`
  } else {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    display = `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]} ${time}`
  }

  return { date, time, display }
}

/**
 * 计算结束时间（默认1小时后）
 */
function getDefaultEndTime(startTime) {
  const d = parseLocalTime(startTime)
  d.setHours(d.getHours() + 1)
  return toLocalISOString(d)
}

/**
 * 获取提醒描述文字
 */
function getRemindText(minutes) {
  if (minutes < 60) return `提前${minutes}分钟`
  if (minutes < 1440) return `提前${minutes / 60}小时`
  return `提前${minutes / 1440}天`
}

module.exports = {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  getToday,
  getNow,
  getNowISO,
  toLocalISOString,
  parseLocalTime,
  generateId,
  formatDateTime,
  getDefaultEndTime,
  getRemindText,
  EVENT_CATEGORIES,
  DEFAULT_REMIND_BEFORE
}
