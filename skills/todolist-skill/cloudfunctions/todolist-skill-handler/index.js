const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function handleGetTodoList({ openid }) {
  if (!openid) {
    return { code: -1, message: 'openid 不能为空', data: null }
  }
  try {
    const res = await db.collection('todo_items')
      .where({ ownerOpenid: openid })
      .orderBy('createTime', 'desc')
      .get()
    return {
      code: 0,
      message: 'success',
      data: {
        items: res.data || []
      }
    }
  } catch (err) {
    console.error('[todolist-skill-handler] getTodoList error:', err.message)
    return { code: -1, message: err.message, data: null }
  }
}

async function handleAddTodo({ openid, title }) {
  if (!openid) {
    return { code: -1, message: 'openid 不能为空', data: null }
  }
  if (!title || !String(title).trim()) {
    return { code: -1, message: 'title 不能为空', data: null }
  }
  try {
    const todoId = `TD${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const now = new Date()
    const data = {
      todoId,
      title: String(title).trim(),
      done: false,
      ownerOpenid: openid,
      createTime: now.toISOString(),
      updatedAt: db.serverDate()
    }
    await db.collection('todo_items').add({ data })
    return {
      code: 0,
      message: 'success',
      data
    }
  } catch (err) {
    console.error('[todolist-skill-handler] addTodo error:', err.message)
    return { code: -1, message: err.message, data: null }
  }
}

async function handleToggleTodo({ openid, todoId }) {
  if (!openid) {
    return { code: -1, message: 'openid 不能为空', data: null }
  }
  if (!todoId) {
    return { code: -1, message: 'todoId 不能为空', data: null }
  }
  try {
    const res = await db.collection('todo_items')
      .where({ todoId, ownerOpenid: openid })
      .limit(1)
      .get()
    if (!res.data || !res.data.length) {
      return { code: -1, message: 'todo_not_found', data: null }
    }
    const todo = res.data[0]
    const newDone = !todo.done
    await db.collection('todo_items')
      .where({ todoId, ownerOpenid: openid })
      .update({
        data: {
          done: newDone,
          updatedAt: db.serverDate()
        }
      })
    return {
      code: 0,
      message: 'success',
      data: {
        todoId,
        done: newDone
      }
    }
  } catch (err) {
    console.error('[todolist-skill-handler] toggleTodo error:', err.message)
    return { code: -1, message: err.message, data: null }
  }
}

async function handleDeleteTodo({ openid, todoId }) {
  if (!openid) {
    return { code: -1, message: 'openid 不能为空', data: null }
  }
  if (!todoId) {
    return { code: -1, message: 'todoId 不能为空', data: null }
  }
  try {
    const res = await db.collection('todo_items')
      .where({ todoId, ownerOpenid: openid })
      .limit(1)
      .get()
    if (!res.data || !res.data.length) {
      return { code: -1, message: 'todo_not_found', data: null }
    }
    await db.collection('todo_items')
      .where({ todoId, ownerOpenid: openid })
      .remove()
    return {
      code: 0,
      message: 'success',
      data: { todoId }
    }
  } catch (err) {
    console.error('[todolist-skill-handler] deleteTodo error:', err.message)
    return { code: -1, message: err.message, data: null }
  }
}

exports.main = async (event) => {
  const { action } = event
  console.log('[todolist-skill-handler] action=', action, 'event=', JSON.stringify(event))

  switch (action) {
    case 'getTodoList':
      return handleGetTodoList(event)
    case 'addTodo':
      return handleAddTodo(event)
    case 'toggleTodo':
      return handleToggleTodo(event)
    case 'deleteTodo':
      return handleDeleteTodo(event)
    default:
      return {
        code: -1,
        message: `未知 action: ${action}`,
        data: null
      }
  }
}
