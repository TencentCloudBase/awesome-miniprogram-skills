/**
 * 云开发中间件（合并初始化 + 错误翻译）
 *
 * 在 skill.use() 中注册，自动处理：
 * 1. 前置：确保 wx.cloud.init() 已执行（防 CLI render 跳过 app.js）
 * 2. 后置：API 抛异常时翻译为友好提示
 *
 * @example
 *   const cloudMw = require('../../_shared/mp-skills-shared/utils/cloud-middleware')
 *   skill.use(cloudMw)
 *   skill.registerAPI('xxx', xxxHandler)
 *
 * 参考：微信小程序 AI 开发模式报告 5.3 节 — 中间件机制
 */

const { translateError } = require('./cloud-error-handler')

// ── 配置 ──
// ★ 请将下面的环境 ID 替换为你的云开发环境 ID
const CLOUD_ENV_ID = '填入你的云开发环境ID'

let _cloudInited = false

function ensureCloudInited() {
  if (_cloudInited) return
  try {
    wx.cloud.init({ env: CLOUD_ENV_ID })
    _cloudInited = true
    console.info('[ai-mode] cloud-middleware: wx.cloud.init() called, env=' + CLOUD_ENV_ID)
  } catch (e) {
    console.warn('[ai-mode] cloud-middleware: wx.cloud.init() failed:', e.message)
  }
}

/**
 * 云开发中间件函数，符合 skill.use(middleware) 签名。
 *
 * 对未兜底的异常做全局兜底：将异常转译为友好提示后，返回标准错误格式
 * `{ isError, content, _meta }` 而非抛出。原始错误详情保留在 `_meta`，
 * 供后续排查。
 *
 * - next() 前：ensureCloudInited()
 * - next() 后：捕获异常 → 翻译 → 返回 isError 格式
 */
async function cloudMiddleware(ctx, next) {
  ensureCloudInited()
  try {
    await next()
  } catch (err) {
    const friendlyMsg = translateError(err, ctx.name)
    console.error('[ai-mode] cloud-middleware: uncaught error in', ctx.name, err.message)

    return {
      isError: true,
      content: [{ type: 'text', text: friendlyMsg }],
      _meta: {
        errorCode: err.errCode || null,
        errorDetail: err.message || null,
      },
    }
  }
}

module.exports = cloudMiddleware
