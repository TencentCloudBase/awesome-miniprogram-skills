const { isPreviewMode, ensureCloudInit, successResult, errorResult, addTodoLocal } = require('../utils/util')

async function addTodo(params = {}) {
  console.info('[ai-mode] addTodo 入口, params=', JSON.stringify(params))
  const title = String((params && params.title) || '').trim()
  if (!title) {
    return errorResult('缺少待办标题。禁止直接新增空待办，请先让用户明确要记录什么事项。')
  }

  if (isPreviewMode()) {
    const data = addTodoLocal(title)
    return successResult(
      `已新增待办「${title}」。请展示最新待办列表卡片，并用一句简短话术告诉用户新增成功。`,
      data,
      { mode: 'list' }
    )
  }

  ensureCloudInit()
  const { result } = await wx.cloud.callFunction({
    name: 'todolist-skill-handler',
    data: { action: 'addTodo', title }
  })

  if (result && result.code === 0 && result.data) {
    return successResult(
      `已新增待办「${title}」。请展示最新待办列表卡片，并用一句简短话术告诉用户新增成功。`,
      result.data,
      { mode: 'list' }
    )
  }

  return errorResult('新增待办失败，请稍后重试。')
}

module.exports = addTodo
