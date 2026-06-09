const { isPreviewMode, ensureCloudInit, successResult, errorResult, toggleTodoLocal } = require('../utils/util')

async function toggleTodo(params = {}) {
  console.info('[ai-mode] toggleTodo 入口, params=', JSON.stringify(params))
  const todoId = params && params.todoId
  if (!todoId) {
    return errorResult('缺少 todoId。禁止直接切换待办状态，请先让用户从列表中选择具体待办。')
  }

  if (isPreviewMode()) {
    const local = toggleTodoLocal(todoId)
    if (!local) {
      return errorResult('未找到该待办。禁止继续修改不存在的待办，请先重新查看列表。')
    }
    return successResult(
      `已更新待办「${local.todo.title}」的完成状态。请展示最新待办列表卡片。`,
      local.data,
      { mode: 'list' }
    )
  }

  ensureCloudInit()
  const { result } = await wx.cloud.callFunction({
    name: 'todolist-skill-handler',
    data: { action: 'toggleTodo', todoId }
  })

  if (result && result.code === 0 && result.data) {
    return successResult(
      `已更新待办完成状态。请展示最新待办列表卡片。`,
      result.data,
      { mode: 'list' }
    )
  }

  return errorResult('更新待办失败，请稍后重试。')
}

module.exports = toggleTodo
