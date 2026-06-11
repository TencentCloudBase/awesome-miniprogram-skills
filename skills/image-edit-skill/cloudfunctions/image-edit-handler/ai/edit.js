/**
 * 图片编辑核心逻辑
 * 1. 将编辑需求转为 prompt，调用 @cloudbase/node-sdk generateImage
 * 2. 使用 Node.js 内置 https 下载图片并上传到云存储持久化
 * 3. 返回原图 + 编辑后图片 fileID（永久）
 */
const https = require('https')
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

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

async function handleEditImage(event, uid) {
  const { originalImage, editDescription, style, size = '1024x1024' } = event

  if (!originalImage || !editDescription) {
    return { code: -1, message: '缺少 originalImage 或 editDescription 参数' }
  }

  const tcb = require('@cloudbase/node-sdk')
  const app = tcb.init({ env: cloud.DYNAMIC_CURRENT_ENV, timeout: 120000 })

  const enhancedPrompt = `基于以下编辑要求修改图片内容：${editDescription}。保持原图主要内容不变。`

  const ai = app.ai()
  const imageModel = ai.createImageModel('hunyuan-image')

  const params = { model: 'hunyuan-image', prompt: enhancedPrompt, size }
  if (style && style !== 'auto') params.style = style

  const res = await imageModel.generateImage(params)

  let editedFileID = ''
  let editedTempUrl = ''

  if (res.data && res.data[0]) {
    editedTempUrl = res.data[0].url

    try {
      const buffer = await downloadUrl(editedTempUrl)
      const timestamp = Date.now()
      const descHash = editDescription.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '_')
      const cloudPath = `ai-images/${uid}/image-edit/${timestamp}_${descHash}.png`
      const uploadRes = await cloud.uploadFile({ cloudPath, fileContent: buffer })
      editedFileID = uploadRes.fileID
    } catch (err) {
      console.error('[image-edit] upload error:', err.message)
    }
  }

  return { code: 0, data: { originalImage, editDescription, editedFileID, editedTempUrl } }
}

module.exports = { handleEditImage }
