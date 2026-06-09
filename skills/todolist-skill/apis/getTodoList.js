const { isPreviewMode, ensureCloudInit, successResult, errorResult, queryTodosLocal } = require('../utils/util')

async function getTodoList() {
  console.info('[ai-mode] getTodoList 入口')

  if (isPreviewMode()) {
    const data = queryTodosLocal()
    return successResult(
      `已查询到 ${data.total} 条待办。请展示待办列表卡片，并允许用户在卡片中切换完成状态或删除。禁止以纯文本逐条展开列表。`,
      data,
      { mode: 'list' }
    )
  }

  ensureCloudInit()
  const { result } = await wx.cloud.callFunction({
    name: 'todolist-skill-handler',
    data: { action: 'getTodoList' }
  })

  if (result && result.code === 0 && result.data) {
    return successResult(
      `已查询到 ${result.data.total} 条待办。请展示待办列表卡片，并允许用户在卡片中切换完成状态或删除。禁止以纯文本逐条展开列表。`,
      result.data,
      { mode: 'list' }
    )
  }

  return errorResult('查询待办失败，请稍后重试。')
}

module.exports = getTodoList
