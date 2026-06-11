const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function errorResult(msg) {
  return { isError: true, content: [{ type: 'text', text: msg }] }
}

module.exports = { PREVIEW_MODE_KEY, isPreviewMode, successResult, errorResult }
