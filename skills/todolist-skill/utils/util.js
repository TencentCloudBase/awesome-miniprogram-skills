const CLOUD_ENV_ID = 'cloud1-5g39elugeec5ba0f'
const COLLECTION = 'todo_items'
let _cloudInited = false

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
  _cloudInited = true
}

function getDb() {
  ensureCloudInit()
  return wx.cloud.database()
}

function getCurrentOpenid() {
  const userInfo = wx.getStorageSync('userInfo') || {}
  return userInfo.openid || 'demo_user'
}

function mapTodo(doc) {
  return {
    todoId: doc._id,
    title: doc.title,
    done: !!doc.done,
    updatedText: formatDate(doc.updatedAt || doc.createTime || new Date())
  }
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚更新'
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
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

async function queryTodos() {
  const db = getDb()
  const openid = getCurrentOpenid()
  const res = await db.collection(COLLECTION)
    .where({ ownerOpenid: openid })
    .orderBy('createTime', 'desc')
    .get()
  const items = (res.data || []).map(mapTodo)
  return { items, total: items.length }
}

module.exports = {
  CLOUD_ENV_ID,
  COLLECTION,
  ensureCloudInit,
  getDb,
  getCurrentOpenid,
  mapTodo,
  errorResult,
  successResult,
  queryTodos
}
