const { isPreviewMode, successResult, errorResult } = require('../utils/util')
const { seedData } = require('../data/seed')

async function editImage(params = {}) {
  const { originalImage, editDescription, style, size } = params

  if (!originalImage) {
    return errorResult('缺少 originalImage 参数。请提供要编辑的图片链接。')
  }
  if (!editDescription) {
    return errorResult('缺少 editDescription 参数。请描述要如何编辑图片。')
  }

  // 预览模式
  if (isPreviewMode()) {
    const data = seedData({ originalImage, editDescription })
    return successResult(
      `已编辑图片（预览模式）`,
      data,
      { originalImage: data.originalImage, editedImage: data.editedTempUrl }
    )
  }

  // 正式模式：调用云函数
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'image-edit-handler',
      data: { action: 'editImage', originalImage, editDescription, style, size }
    })

    if (result && result.code === 0 && result.data) {
      return successResult(
        '图片编辑完成',
        result.data,
        {
          originalImage: result.data.originalImage,
          editedImage: result.data.editedFileID || result.data.editedTempUrl
        }
      )
    }

    return errorResult(result?.message || '图片编辑失败')
  } catch (err) {
    console.error('[editImage] error:', err)
    return errorResult(`图片编辑出错：${err.message || '未知错误'}`)
  }
}

module.exports = editImage
