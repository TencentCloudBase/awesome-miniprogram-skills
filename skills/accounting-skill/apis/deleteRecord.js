/**
 * deleteRecord - 删除一条记账记录
 */
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  fenToYuan
} = require('../utils/util')
const { deleteLocalRecord } = require('../utils/storage')

async function deleteRecord(params = {}) {
  const { recordId } = params

  // 参数校验
  if (!recordId) {
    return errorResult('请提供要删除的记录ID')
  }

  // 预览模式
  if (isPreviewMode()) {
    const deleted = deleteLocalRecord(recordId)
    if (!deleted) {
      return errorResult('未找到该记录，可能已被删除')
    }

    const typeText = deleted.type === 'expense' ? '支出' : '收入'
    const structuredContent = {
      success: true,
      deletedRecord: {
        recordId: deleted.recordId,
        amount: deleted.amount,
        type: deleted.type,
        category: deleted.category,
        note: deleted.note,
        date: deleted.date
      },
      action: 'delete'
    }

    return successResult(
      `已删除${typeText}记录：${deleted.category} ${fenToYuan(deleted.amount)} 元`,
      structuredContent
    )
  }

  // 正式模式
  try {
    const result = await callCloud('deleteRecord', { recordId })

    if (result && result.code === 0 && result.data) {
      const { deletedRecord } = result.data
      const typeText = deletedRecord.type === 'expense' ? '支出' : '收入'
      return successResult(
        `已删除${typeText}记录：${deletedRecord.category} ${fenToYuan(deletedRecord.amount)} 元`,
        { ...result.data, action: 'delete' }
      )
    }
    return errorResult(result?.message || '删除失败')
  } catch (err) {
    console.error('[accounting-skill] deleteRecord error:', err)
    return errorResult('删除记录失败，请稍后重试')
  }
}

module.exports = deleteRecord
