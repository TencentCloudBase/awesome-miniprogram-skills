// skills/taxi-skill/apis/getTripHistory.js
const {
  ensureCloudInit,
  successResult,
  errorResult,
  historyTrips
} = require('../utils/util')

async function getTripHistory(params = {}) {
  console.info('[ai-mode] getTripHistory 入口, params=', JSON.stringify(params))

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'getTripHistory' }
    })
    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] getTripHistory 云函数返回成功')
      return buildResult(result.data.items || [])
    }
  } catch (err) {
    console.error('[ai-mode] getTripHistory 云函数调用失败，降级到种子数据:', err.message)
  }

  const items = historyTrips.map(t => ({
    tripId: t.tripId,
    origin: t.origin,
    destination: t.destination,
    carTypeName: t.carTypeName,
    price: t.price,
    status: t.status,
    startTime: t.startTime,
    endTime: t.endTime,
    duration: t.duration,
    distance: t.distance,
    driverName: t.driverName,
    plateNumber: t.plateNumber
  }))

  return buildResult(items)
}

function buildResult(items) {
  if (items.length > 0) {
    return successResult(
      `您有 ${items.length} 条历史行程记录。请展示历史行程列表卡片。`,
      { items, total: items.length },
      { total: items.length }
    )
  }
  return successResult(
    '您还没有历史行程记录。',
    { items: [], total: 0 },
    { total: 0 }
  )
}

module.exports = getTripHistory
