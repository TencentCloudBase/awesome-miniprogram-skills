/**
 * accounting-skill 工具函数
 */
const config = require('../config')

// 预览模式开关 key（所有 Skill 统一）
const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

/**
 * 判断是否为预览模式
 * 与 payment-skill 保持一致：只有明确设置为 true 才进入预览模式
 * 但如果云函数未部署（envId 为空），也自动进入预览模式
 */
function isPreviewMode() {
  // 如果没有配置云环境 ID，强制使用预览模式
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

  // 检查云环境是否可用
  if (!wx.cloud) {
    throw new Error('云开发环境未初始化，请先调用 wx.cloud.init()')
  }

  // 带超时的云函数调用
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
 * 金额：元转分
 */
function yuanToFen(yuan) {
  return Math.round(Number(yuan) * 100)
}

/**
 * 金额：分转元
 */
function fenToYuan(fen) {
  return (Number(fen) / 100).toFixed(2)
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
 * 获取本月第一天 YYYY-MM-DD
 */
function getMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * 获取当月 YYYY-MM
 */
function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// 支出分类
const EXPENSE_CATEGORIES = ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '通讯', '其他']

// 收入分类
const INCOME_CATEGORIES = ['工资', '兼职', '投资', '红包', '退款', '其他']

module.exports = {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  yuanToFen,
  fenToYuan,
  getToday,
  getNow,
  getMonthStart,
  getCurrentMonth,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES
}
