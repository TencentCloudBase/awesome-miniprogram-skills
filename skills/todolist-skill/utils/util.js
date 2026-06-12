const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'
const TODOS_STORAGE_KEY = 'mp_skills_todos'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) === true
}

const CLOUD_ENV_ID = 'cloud1-5g39elugeec5ba0f'
const COLLECTION = 'todo_items'
let _cloudInited = false

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
  _cloudInited = true
}

function getCurrentOpenid() {
  const userInfo = wx.getStorageSync('userInfo') || {}
  return userInfo.openid || 'demo_user'
}

function mapTodo(doc) {
  return {
    todoId: doc.todoId || doc._id,
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

// --- 预览模式：local storage mock ---

function getLocalTodos() {
  try {
    return wx.getStorageSync(TODOS_STORAGE_KEY) || []
  } catch (_) {
    return []
  }
}

function saveLocalTodos(todos) {
  wx.setStorageSync(TODOS_STORAGE_KEY, todos)
}

function queryTodosLocal() {
  const items = getLocalTodos().map(mapTodo)
  return { items, total: items.length }
}

function addTodoLocal(title) {
  const todos = getLocalTodos()
  const newTodo = {
    _id: `todo_${Date.now()}`,
    todoId: `todo_${Date.now()}`,
    title,
    done: false,
    createTime: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  todos.unshift(newTodo)
  saveLocalTodos(todos)
  return queryTodosLocal()
}

function toggleTodoLocal(todoId) {
  const todos = getLocalTodos()
  const todo = todos.find(t => (t.todoId || t._id) === todoId)
  if (!todo) return null
  todo.done = !todo.done
  todo.updatedAt = new Date().toISOString()
  saveLocalTodos(todos)
  return { todo, data: queryTodosLocal() }
}

function deleteTodoLocal(todoId) {
  const todos = getLocalTodos()
  const idx = todos.findIndex(t => (t.todoId || t._id) === todoId)
  if (idx === -1) return null
  const deleted = todos[idx]
  todos.splice(idx, 1)
  saveLocalTodos(todos)
  return { deleted, data: queryTodosLocal() }
}

module.exports = {
  PREVIEW_MODE_KEY,
  isPreviewMode,
  CLOUD_ENV_ID,
  COLLECTION,
  TODOS_STORAGE_KEY,
  ensureCloudInit,
  getCurrentOpenid,
  mapTodo,
  errorResult,
  successResult,
  getLocalTodos,
  saveLocalTodos,
  queryTodosLocal,
  addTodoLocal,
  toggleTodoLocal,
  deleteTodoLocal
}
