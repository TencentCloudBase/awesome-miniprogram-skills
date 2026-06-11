/**
 * 图片生成核心逻辑
 * 1. 调用 @cloudbase/node-sdk generateImage 生成图片
 * 2. 使用 Node.js 内置 https 下载临时图片并上传到云存储持久化
 * 3. 返回 fileID（永久）和 tempUrl（24h 有效）
 */
const https = require('https')
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 通过 https 下载远程图片
 */
function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败, HTTP ${res.statusCode}`))
        return
      }
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function handleGenerateImage(event, uid) {
  const { prompt, size = '1024x1024', style, negativePrompt, n = 1 } = event

  if (!prompt) {
    return { code: -1, message: '缺少 prompt 参数' }
  }

  const tcb = require('@cloudbase/node-sdk')
  const app = tcb.init({ env: cloud.DYNAMIC_CURRENT_ENV, timeout: 120000 })

  const ai = app.ai()
  const imageModel = ai.createImageModel('hunyuan-image')

  const params = { model: 'hunyuan-image', prompt, size }
  if (negativePrompt) params.negative_prompt = negativePrompt
  if (style && style !== 'auto') params.style = style

  const res = await imageModel.generateImage(params)

  const images = await Promise.all((res.data || []).slice(0, n).map(async (item) => {
    const { url, revised_prompt } = item

    try {
      const buffer = await downloadUrl(url)
      const timestamp = Date.now()
      const promptHash = prompt.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '_')
      const cloudPath = `ai-images/${uid}/image-gen/${timestamp}_${promptHash}.png`

      const uploadRes = await cloud.uploadFile({ cloudPath, fileContent: buffer })

      return {
        fileID: uploadRes.fileID,
        tempUrl: url,
        revisedPrompt: revised_prompt || ''
      }
    } catch (err) {
      console.error('[image-gen] download/upload error:', err.message)
      return { fileID: '', tempUrl: url, revisedPrompt: revised_prompt || '' }
    }
  }))

  return { code: 0, data: { images, usage: { n: images.length } } }
}

module.exports = { handleGenerateImage }
