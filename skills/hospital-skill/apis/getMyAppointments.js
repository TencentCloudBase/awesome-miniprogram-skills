// skills/hospital-skill/apis/getMyAppointments.js
const { appointments } = require('../data/seed')
const {
  ensureCloudInit,
  successResult
} = require('../utils/util')

async function getMyAppointments(params = {}) {
  console.info('[ai-mode] getMyAppointments 入口, params=', JSON.stringify(params))

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'getMyAppointments' }
    })

    const items = (result && result.code === 0 && result.data && result.data.items) || []
    console.info('[ai-mode] getMyAppointments 云函数返回数量=', items.length)
    return buildResult(items)
  } catch (err) {
    console.error('[ai-mode] getMyAppointments 出错:', err.message)
    return buildResult(appointments)
  }
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
