const { stores } = require('../data/seed')

const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
}

const CLOUD_ENV_ID = 'cloud1-5g39elugeec5ba0f'
let _cloudInited = false

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
  _cloudInited = true
}

function errorResult(msg, structuredContent, meta) {
  const result = { isError: true, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function defaultStoreList(keyword = '') {
  const q = String(keyword || '').trim().toLowerCase()
  const list = q
    ? stores.filter((item) => {
        const hay = [item.storeName, item.city, item.district, ...(item.keywords || [])]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    : stores
  return list.map((item) => ({
    storeId: item.storeId,
    storeName: item.storeName,
    distance: item.distance,
    waitingCount: item.waitingCount,
    estimatedMinutes: item.estimatedMinutes,
    queueEnabled: item.queueEnabled
  }))
}

function defaultStoreDetail(storeId) {
  return stores.find((item) => item.storeId === storeId) || null
}

function genTicketId() {
  return `T${Date.now().toString(36).toUpperCase()}`
}

module.exports = {
  PREVIEW_MODE_KEY,
  isPreviewMode,
  CLOUD_ENV_ID,
  ensureCloudInit,
  errorResult,
  successResult,
  defaultStoreList,
  defaultStoreDetail,
  genTicketId
}
