const { successResult, errorResult, queryTodos } = require('../utils/util')

async function getTodoList() {
  console.info('[ai-mode] getTodoList 入口')
  try {
    const data = await queryTodos()
    return successResult(
      `已查询到 ${data.total} 条待办。请展示待办列表卡片，并允许用户在卡片中切换完成状态或删除。禁止以纯文本逐条展开列表。`,
      data,
      { mode: 'list' }
    )
  } catch (err) {
    console.error('[ai-mode] getTodoList 出错:', err.message)
    return errorResult(`查询待办失败：${err.message}`)
  }
}

module.exports = getTodoList
