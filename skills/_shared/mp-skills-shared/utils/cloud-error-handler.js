/**
 * 云开发错误友好提示拦截层
 *
 * 将 wx.cloud.callFunction 等技术错误码转换为用户可操作的友好提示。
 * 仅在生产模式下生效，预览模式不涉及真实云调用。
 *
 * 错误来源：
 * - 微信 SDK errCode: 数值如 -501001
 * - CloudBase 错误码: 字符串如 FUNCTION_NOT_FOUND
 *
 * @example
 *   const { callFunction } = require('../../_shared/utils/cloud-error-handler')
 *   const { result } = await callFunction('my-handler', { action: 'doSomething' })
 */

// ============================================================
// 错误码 → 友好提示映射
// ============================================================

/**
 * 友好的提示消息，键同时匹配数值 errCode 和字符串错误码。
 * 优先级：字符串错误码 > 数值 errCode
 */
const FRIENDLY_MESSAGES = {
  // ── 云函数 ──
  'FUNCTION_NOT_FOUND': (ctx) =>
    `云函数「${ctx.funcName}」尚未部署。\n请执行 bash scripts/setup-cloudfunctions.sh 聚合云函数后，使用 CloudBase CLI 或 MCP 工具部署。`,
  'FUNCTIONS_STATUS_ABNORMITY': (ctx) =>
    `云函数「${ctx.funcName}」状态异常（可能正在更新中）。\n请稍后重试或前往控制台检查：https://tcb.cloud.tencent.com/dev#/scf`,
  'FUNCTIONS_EXECUTE_FAIL': (ctx) =>
    `云函数「${ctx.funcName}」执行出错。\n请前往控制台查看日志：https://tcb.cloud.tencent.com/dev#/scf`,
  'FUNCTION_INVOCATION_FAILED': (ctx) =>
    `云函数「${ctx.funcName}」调用超时或失败。\n请前往控制台查看日志：https://tcb.cloud.tencent.com/dev#/scf`,
  'FUNCTIONS_TIME_LIMIT_EXCEEDED': (ctx) =>
    `云函数「${ctx.funcName}」执行超时。\n可在控制台调整函数超时时间：https://tcb.cloud.tencent.com/dev#/scf`,
  'FUNCTION_TIME_LIMIT_EXCEEDED': (ctx) =>
    `云函数「${ctx.funcName}」执行超时。`,
  'FUNCTIONS_MEMORY_LIMIT_EXCEEDED': (ctx) =>
    `云函数「${ctx.funcName}」内存不足。\n可在控制台调整函数内存配置。`,
  'FUNCTION_MEMORY_LIMIT_EXCEEDED': (ctx) =>
    `云函数「${ctx.funcName}」内存不足。`,
  'FUNCTION_QUALIFIER_NOT_FOUND': (ctx) =>
    `云函数「${ctx.funcName}」指定版本不存在（HTTP 云函数路由未配置）。\n请在控制台检查 HTTP 访问服务路由：https://tcb.cloud.tencent.com/dev#/gateway`,
  'FUNCTION_EXCEED_RESOURCE_LIMIT': (ctx) =>
    `云函数「${ctx.funcName}」请求太频繁，超出预置并发限制。\n请稍后重试。`,
  'FUNCTION_PARAM_INVALID': (ctx) =>
    `云函数「${ctx.funcName}」调用参数异常。`,

  // ── 系统级 ──
  'SYS_ERR': '云开发系统内部异常，请稍后重试。',
  'SERVER_TIMEOUT': '云开发服务响应超时，请稍后重试。',
  'RESOURCE_NOT_INITIAL': '云资源尚未初始化完成，请等待约 10 分钟后重试。',
  'INVALID_ENV': '云开发环境未找到，请检查环境 ID 是否正确。\n环境 ID 可在控制台获取：https://tcb.cloud.tencent.com/dev',
  'INVALID_ENV_STATUS': '云开发环境状态异常（可能已隔离或欠费），请前往控制台检查。',
  'ENV_ABNORMAL': '云开发环境状态异常，请检查云托管服务、版本状态是否正常。',
  'ENV_NOT_READY': '云开发环境资源尚未准备完毕，请检查环境是否初始化完成。',
  'ENV_FEATURE_NOT_CONFIGURED': '环境中不存在访问的目标资源，请检查对应服务是否已开通。',

  // ── 数据库 ──
  'DATABASE_REQUEST_FAILED': '数据库请求失败。\n请确认已开通数据库服务：https://tcb.cloud.tencent.com/dev#/db',
  'DATABASE_PERMISSION_DENIED': '数据库权限不足。\n请在控制台检查集合安全规则配置：https://tcb.cloud.tencent.com/dev#/db',
  'DATABASE_COLLECTION_NOT_EXIST': '数据库集合不存在。\n云函数首次调用时会自动创建集合，请确认云函数已正确部署。',
  'DATABASE_COLLECTION_ALREADY_EXIST': '数据库集合已存在（无需操作）。',
  'DATABASE_COLLECTION_EXCEED_LIMIT': '数据库集合数量超出限制，请在控制台清理无用集合。',
  'DATABASE_TIMEOUT': '数据库请求超时，请稍后重试。',
  'DATABASE_DUPLICATE_WRITE': '数据写入冲突（索引键重复）。',
  'EXCEED_REQUEST_LIMIT': '数据库读写请求配额耗尽，请稍后重试或升级套餐。',
  'EXCEED_RATELIMIT': '请求频率超过套餐资源限制，请稍后重试。',
  'EXCEED_CONCURRENT_REQUEST_LIMIT': '请求并发超限，请稍后重试。',

  // ── 云存储 ──
  'STORAGE_REQUEST_FAIL': '云存储请求失败。\n请确认已开通云存储服务：https://tcb.cloud.tencent.com/dev#/storage',
  'STORAGE_EXCEED_AUTHORITY': '无权操作云存储资源。\n请在控制台检查存储权限配置：https://tcb.cloud.tencent.com/dev#/storage',
  'STORAGE_FILE_NONEXIST': '云存储文件不存在（可能已被删除或过期）。',
  'STORAGE_FILE_PATH_CONFLICT': '云存储文件路径冲突。',
  'STORAGE_SIGN_PARAM_INVALID': '云存储文件元数据解析失败。',
  'EXCEED_UPLOAD_MAXFILESIZE': '上传文件大小超出限制。',
  'CDN_SIGNATURE_MISSING': '文件访问链接签名缺失。',
  'CDN_INVALID_SIGNATURE': '文件访问链接签名不正确。',
  'CDN_SIGNATURE_EXPIRED': '文件访问链接签名已过期，请重新获取。',

  // ── AI 模型 ──
  'AI_MODEL_NOT_FOUND': 'AI 模型未找到。\n请在控制台开启所需模型：https://tcb.cloud.tencent.com/dev#/ai',
  'AI_MODEL_CONFIG_MISSING': 'AI 模型缺少必要配置（如 API Key），请在控制台配置。',
  'AI_MODEL_DISABLED': 'AI 模型已停用。\n请在控制台重新开启：https://tcb.cloud.tencent.com/dev#/ai',
  'AI_MODEL_NOT_SUPPORTED': '不支持的 AI 模型，请更换其他可用模型。',
  'EXCEED_TOKEN_QUOTA_LIMIT': 'AI Token 用量超出配额。\n请购买 Token 资源包或等待下个计费周期。小程序成长计划提供 hy3-preview 免费额度。',

  // ── HTTP 访问服务 ──
  'HTTPSERVICE_NONACTIVATED': 'HTTP 访问服务未开启。\n请前往控制台开启：https://tcb.cloud.tencent.com/dev#/gateway',
  'INVALID_PATH': 'HTTP 转发规则未匹配。\n请检查控制台 HTTP 访问服务转发规则配置。',
  'SERVICE_NOT_FOUND': '未找到对应的云托管服务，请检查服务是否已部署。',

  // ── 登录认证 ──
  'CHECK_LOGIN_FAILED': '登录态校验失败，请重新进入小程序。',
  'ACCESS_TOKEN_EXPIRED': '登录已过期，请重新进入小程序。',

  // ── 欠费 ──
  'SERVICE_CHARGE_OVERDUE': '账户欠费停机，请及时充值。',

  // ── 权限 ──
  'PERMISSION_DENIED': '权限被拒绝。\n请检查安全规则配置或登录状态。',
  'EXCEED_AUTHORITY': '超出权限范围。\n请检查当前用户是否有权限执行此操作。',

  // ── 默认 ──
  'DEFAULT_DOMAIN_EXPIRED': '默认域名已过期。\n请前往控制台续期或绑定自定义域名。',
};

/**
 * 数值 errCode → 友好提示（微信 SDK 层，不带 CloudBase 错误码时使用）
 */
const SDK_ERROR_MESSAGES = {
  '-501001': '云开发系统内部异常，请稍后重试。',
  '-501002': '云开发服务响应超时，请稍后重试。',
  '-501016': '读写请求配额耗尽，请稍后重试或升级套餐。',
  '-501023': '权限被拒绝。请检查安全规则配置或登录状态。',
  '-502001': '数据库请求失败。请确认已开通数据库服务：https://tcb.cloud.tencent.com/dev#/db',
  '-502003': '数据库操作未授权。请在控制台检查集合安全规则：https://tcb.cloud.tencent.com/dev#/db',
  '-503001': '云存储请求失败。请确认已开通云存储服务：https://tcb.cloud.tencent.com/dev#/storage',
  '-503002': '无权操作云存储资源。请在控制台检查存储权限：https://tcb.cloud.tencent.com/dev#/storage',
  '-404011': '云函数执行失败。请前往控制台查看日志：https://tcb.cloud.tencent.com/dev#/scf',
  '-601001': '微信系统错误，请稍后重试。',
  '-601011': '无权限执行此操作。',
  '-606003': '账户欠费，请及时充值。',
  '-604101': '云调用 API 权限不足，请在控制台检查权限配置。',
  '-1': '云开发环境未初始化。请在 app.js 中调用 wx.cloud.init({ env: \'你的环境ID\' }) 完成初始化。\n环境 ID 可在控制台获取：https://tcb.cloud.tencent.com/dev',
};

/**
 * 从错误信息中提取函数名
 */
function extractFuncName(errMsg) {
  const match = errMsg && errMsg.match(/cloud\.callFunction:fail.*?(\w[\w-]*\w)/)
  return match ? match[1] : 'unknown'
}

/**
 * 从错误信息中提取 CloudBase 后端错误码（字符串格式）
 * 格式如: "... errMsg: FUNCTION_NOT_FOUND" 或 "... errMsg: DATABASE_PERMISSION_DENIED"
 */
function extractCloudBaseErrorCode(errMsg) {
  const match = errMsg && errMsg.match(/errMsg:\s*(\w[\w_]*\w)/)
  return match ? match[1] : null
}

/**
 * 从错误信息中提取微信 SDK errCode（数值格式）
 * 格式如: "... errCode: -501001" 或 "... errCode: -502003"
 */
function extractSdkErrCode(errMsg) {
  const match = errMsg && errMsg.match(/errCode:\s*(-?\d+)/)
  return match ? match[1] : null
}

/**
 * 将云开发错误翻译为友好提示
 * @param {Error|object} err - 错误对象
 * @param {string} funcName - 云函数名称
 * @returns {string} 友好提示文字
 */
function translateError(err, funcName) {
  const msg = (err && (err.message || err.errMsg || String(err))) || ''

  // 1. 先尝试匹配 CloudBase 后端错误码（更精确）
  const cloudbaseCode = extractCloudBaseErrorCode(msg)
  if (cloudbaseCode && FRIENDLY_MESSAGES[cloudbaseCode]) {
    const template = FRIENDLY_MESSAGES[cloudbaseCode]
    return typeof template === 'function' ? template({ funcName }) : template
  }

  // 2. 尝试匹配微信 SDK errCode
  const sdkCode = extractSdkErrCode(msg)
  if (sdkCode && SDK_ERROR_MESSAGES[sdkCode]) {
    return SDK_ERROR_MESSAGES[sdkCode]
  }

  // 3. 云开发未初始化（多种关键字匹配）
  if (msg.includes('wx.cloud.init') ||
      msg.includes('Cloud API is not enabled') ||
      msg.includes('Cloud API isn\'t enabled') ||
      msg.includes('cloud.init first')) {
    return '云开发环境未初始化。\n请在 app.js 中调用 wx.cloud.init({ env: \'你的环境ID\' }) 完成初始化。\n环境 ID 可在控制台获取：https://tcb.cloud.tencent.com/dev'
  }

  // 4. 未知错误，保留原始信息但附加排查提示
  return `云调用失败：${msg}\n\n如问题持续，请前往控制台排查：https://tcb.cloud.tencent.com/dev`
}

module.exports = {
  translateError,
  extractCloudBaseErrorCode,
  extractSdkErrCode,
  FRIENDLY_MESSAGES,
  SDK_ERROR_MESSAGES
}
