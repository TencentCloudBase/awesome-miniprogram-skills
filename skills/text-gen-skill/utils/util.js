const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) === true
}

let _cloudInited = false

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ traceUser: true })
  _cloudInited = true
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function errorResult(msg, structuredContent) {
  const result = { isError: true, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  return result
}

module.exports = {
  PREVIEW_MODE_KEY,
  isPreviewMode,
  ensureCloudInit,
  successResult,
  errorResult
}
