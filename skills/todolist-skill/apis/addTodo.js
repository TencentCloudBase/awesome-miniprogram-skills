const { successResult, errorResult, getDb, getCurrentOpenid, queryTodos } = require('../utils/util')

async function addTodo(params = {}) {
  console.info('[ai-mode] addTodo 入口, params=', JSON.stringify(params))
  const title = String((params && params.title) || '').trim()
  if (!title) {
    return errorResult('缺少待办标题。禁止直接新增空待办，请先让用户明确要记录什么事项。')
  }

  try {
    const db = getDb()
    await db.collection('todo_items').add({
      data: {
        ownerOpenid: getCurrentOpenid(),
        title,
        done: false,
        createTime: new Date(),
        updatedAt: new Date()
      }
    })
    const data = await queryTodos()
    return successResult(
      `已新增待办「${title}」。请展示最新待办列表卡片，并用一句简短话术告诉用户新增成功。`,
      data,
      { mode: 'list' }
    )
  } catch (err) {
    console.error('[ai-mode] addTodo 出错:', err.message)
    return errorResult(`新增待办失败：${err.message}`)
  }
}

module.exports = addTodo
