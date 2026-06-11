const { isPreviewMode, successResult, errorResult } = require('../utils/util')
const { seedData } = require('../data/seed')

async function generateImage(params = {}) {
  const { prompt, style, size, negativePrompt, n } = params

  if (!prompt) {
    return errorResult('缺少 prompt 参数。请提供要生成图片的内容描述。')
  }

  // 预览模式
  if (isPreviewMode()) {
    const data = seedData({ prompt, style, size, n })
    return successResult(
      `已生成图片（预览模式，共${data.usage.n}张）`,
      data,
      { images: data.images }
    )
  }

  // 正式模式：调用云函数
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'image-gen-handler',
      data: { action: 'generateImage', prompt, style, size, negativePrompt, n }
    })

    if (result && result.code === 0 && result.data) {
      const images = result.data.images || []
      return successResult(
        `图片生成完成（共${images.length}张）`,
        { images, usage: result.data.usage },
        { images }
      )
    }

    return errorResult(result?.message || '图片生成失败')
  } catch (err) {
    console.error('[generateImage] error:', err)
    return errorResult(`图片生成出错：${err.message || '未知错误'}`)
  }
}

module.exports = generateImage
