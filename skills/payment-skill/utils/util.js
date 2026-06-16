// skills/payment-skill/utils/util.js
const config = require('../config')
const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

/**
 * 获取云开发配置
 * 优先级：config.js > app.globalData > 默认值
 * 用户只需修改 config.js 即可完成配置
 */
function getCloudConfig() {
  // functionName 优先从 config.js 读取（config.js 通过 skillId 从 cloudbaserc.json 精确匹配）
  const functionName = config.functionName || 'pay-common'

  // envId 优先级：config.js > app.globalData > 空（由 SDK 自动推断当前环境）
  let envId = config.envId || ''

  // config.js 中 envId 为空时（模板变量场景），尝试从 app.globalData 补充
  if (!envId) {
    try {
      const app = getApp()
      if (app && app.globalData && app.globalData.envId) {
        envId = app.globalData.envId
      }
    } catch (e) {
      // skill 在独立分包中运行时 getApp() 可能返回受限对象
      console.warn('[payment-skill] getApp() 失败，使用 config.js 配置')
    }
  }

  return { functionName, envId }
}

/**
 * 确保云开发已初始化
 */
let cloudInited = false
function ensureCloudInit() {
  if (cloudInited) return true

  if (!wx.cloud) {
    console.error('[payment-skill] ❌ wx.cloud 为 undefined！')
    console.error('[payment-skill] 请检查：')
    console.error('  1. app.json 中是否有 "cloud": true')
    console.error('  2. 当前 AppID 是否已开通云开发')
    console.error('  3. project.config.json 中的 appid 是否正确')
    return false
  }

  const { envId } = getCloudConfig()
  try {
    wx.cloud.init({
      env: envId,
      traceUser: true
    })
    cloudInited = true
    console.info('[payment-skill] ✅ 云开发初始化成功, env:', envId)
    return true
  } catch (e) {
    if (e && e.message && e.message.indexOf('bindEnvChanged') > -1) {
      cloudInited = true
      return true
    }
    console.warn('[payment-skill] 云开发 init 异常（可能已初始化过）:', e)
    cloudInited = true
    return true
  }
}

/**
 * 响应结构规范化：兼容 {status, data} 和 {code, data} 两种格式
 */
function normalizeResult(result) {
  if (!result) return { code: -1, msg: '响应为空', data: null }
  if (typeof result.code === 'undefined' && typeof result.status !== 'undefined') {
    return {
      code: (result.status >= 200 && result.status < 300) ? 0 : -1,
      msg: result.message || result.msg || '',
      data: result.data
    }
  }
  return result
}

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) === true
}

function errorResult(msg) {
  return { isError: true, content: [{ type: 'text', text: msg }] }
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

/**
 * 调用 pay-common 后端
 * 自动选择最佳调用方式：优先 callHTTPFunction，不可用时降级为 callFunction
 * @param {string} action - 路由路径名，如 'wxpay_order'
 * @param {object} data - 请求参数
 * @returns {Promise<object>} 后端返回结果 { code, msg, data }
 */
function callPayCommon(action, data) {
  const { functionName, envId } = getCloudConfig()

  console.info('[payment-skill][request] action:', action, 'functionName:', functionName, 'envId:', envId)

  // 确保云开发已初始化
  ensureCloudInit()

  // 检查云开发是否可用
  if (!wx.cloud) {
    return Promise.reject({
      code: -1,
      msg: 'wx.cloud 不可用。请确认已开通云开发并重新打开项目。'
    })
  }

  const config = {}
  if (envId) config.env = envId

  // 优先使用 callHTTPFunction（需基础库 >= 3.15.1）
  if (typeof wx.cloud.callHTTPFunction === 'function') {
    console.info('[payment-skill] 使用 callHTTPFunction 调用')
    return new Promise((resolve, reject) => {
      wx.cloud.callHTTPFunction({
        name: functionName,
        config,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        path: `/wx-pay/${action}`,
        data,
        success(res) {
          console.info('[payment-skill] callHTTPFunction 成功, statusCode:', res.statusCode)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(normalizeResult(res.data))
          } else {
            reject({ code: -1, msg: `HTTP ${res.statusCode}`, data: res.data })
          }
        },
        fail(err) {
          console.error('[payment-skill] callHTTPFunction 失败:', err)
          reject(err)
        }
      })
    })
  }

  // 降级使用 callFunction（基础库 >= 2.2.3）
  if (typeof wx.cloud.callFunction === 'function') {
    console.info('[payment-skill] callHTTPFunction 不可用，降级使用 callFunction')
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: functionName,
        config,
        data: {
          action: action,
          path: `/wx-pay/${action}`,
          method: 'POST',
          body: data,
          httpMethod: 'POST',
          headers: { 'Content-Type': 'application/json' }
        },
        success(res) {
          console.info('[payment-skill] callFunction 成功')
          resolve(normalizeResult(res.result))
        },
        fail(err) {
          console.error('[payment-skill] callFunction 失败:', err)
          reject(err)
        }
      })
    })
  }

  // 两者都不可用
  return Promise.reject({
    code: -1,
    msg: '当前环境不支持云函数调用，请升级微信开发者工具和基础库版本'
  })
}

module.exports = {
  isPreviewMode,
  errorResult,
  successResult,
  callPayCommon,
  getCloudConfig
}
