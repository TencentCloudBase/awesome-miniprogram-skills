// skills/hospital-skill/apis/getMyAppointments.js
const { appointments } = require('../data/seed')
const {
  isPreviewMode,
  successResult,
  errorResult
} = require('../utils/util')

async function getMyAppointments(params = {}) {
  console.info('[ai-mode] getMyAppointments 入口, params=', JSON.stringify(params))

  if (isPreviewMode()) {
    return buildResult(appointments)
  }

  const { result } = await wx.cloud.callFunction({
    name: 'hospital-skill-handler',
    data: { action: 'getMyAppointments' }
  })

  if (result && result.code === 0 && result.data) {
    const items = result.data.items || []
    console.info('[ai-mode] getMyAppointments 云函数返回数量=', items.length)
    return buildResult(items)
  }
  return errorResult(result?.message || '请求失败')
}

function buildResult(items) {
  const total = items.length
  if (total > 0) {
    return successResult(
      `共 ${total} 条挂号记录，请展示挂号记录列表卡片。`,
      { items, total }
    )
  }
  return successResult(
    '当前没有挂号记录。请展示空列表卡片。',
    { items: [], total: 0 }
  )
}

module.exports = getMyAppointments
