const { successResult, errorResult, getDb, getCurrentOpenid, queryTodos } = require('../utils/util')

async function deleteTodo(params = {}) {
  console.info('[ai-mode] deleteTodo 入口, params=', JSON.stringify(params))
  const todoId = params && params.todoId
  if (!todoId) {
    return errorResult('缺少 todoId。禁止直接删除待办，请先让用户从列表中选择具体待办。')
  }

  try {
    const db = getDb()
    const res = await db.collection('todo_items').doc(todoId).get()
    const todo = res.data
    if (!todo || todo.ownerOpenid !== getCurrentOpenid()) {
      return errorResult('未找到该待办。禁止继续删除不存在的待办，请先重新查看列表。')
    }

    await db.collection('todo_items').doc(todoId).remove()
    const data = await queryTodos()
    return successResult(
      `已删除待办「${todo.title}」。请展示最新待办列表卡片。`,
      data,
      { mode: 'list' }
    )
  } catch (err) {
    console.error('[ai-mode] deleteTodo 出错:', err.message)
    return errorResult(`删除待办失败：${err.message}`)
  }
}

module.exports = deleteTodo
