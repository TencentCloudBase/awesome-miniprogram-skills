const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { handleGenerateImage } = require('./ai/image')

exports.main = async (event) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const uid = wxContext.OPENID || 'anonymous'

  try {
    switch (action) {
      case 'generateImage':
        return await handleGenerateImage(event, uid)
      default:
        return { code: -1, message: `未知 action: ${action}` }
    }
  } catch (err) {
    console.error('[image-gen-handler] error:', err)
    return { code: -1, message: err.message || '服务器错误' }
  }
}
