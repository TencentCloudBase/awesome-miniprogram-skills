const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const { handleEditImage } = require('./ai/edit')

exports.main = async (event) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const uid = wxContext.OPENID || 'anonymous'

  try {
    switch (action) {
      case 'editImage':
        return await handleEditImage(event, uid)
      default:
        return { code: -1, message: `未知 action: ${action}` }
    }
  } catch (err) {
    console.error('[image-edit-handler] error:', err)
    return { code: -1, message: err.message || '服务器错误' }
  }
}
