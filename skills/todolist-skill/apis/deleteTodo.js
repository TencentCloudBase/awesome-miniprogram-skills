const { isPreviewMode, ensureCloudInit, successResult, errorResult, deleteTodoLocal } = require('../utils/util')

async function deleteTodo(params = {}) {
  console.info('[ai-mode] deleteTodo 入口, params=', JSON.stringify(params))
  const todoId = params && params.todoId
  if (!todoId) {
    return errorResult('缺少 todoId。禁止直接删除待办，请先让用户从列表中选择具体待办。')
  }

  if (isPreviewMode()) {
    const local = deleteTodoLocal(todoId)
    if (!local) {
      return errorResult('未找到该待办。禁止继续删除不存在的待办，请先重新查看列表。')
    }
    return successResult(
      `已删除待办「${local.deleted.title}」。请展示最新待办列表卡片。`,
      local.data,
      { mode: 'list' }
    )
  }

  ensureCloudInit()
  const { result } = await wx.cloud.callFunction({
    name: 'todolist-skill-handler',
    data: { action: 'deleteTodo', todoId }
  })

  if (result && result.code === 0 && result.data) {
    return successResult(
      `已删除待办。请展示最新待办列表卡片。`,
      result.data,
      { mode: 'list' }
    )
  }

  return errorResult('删除待办失败，请稍后重试。')
}

module.exports = deleteTodo
