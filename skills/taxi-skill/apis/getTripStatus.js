// skills/taxi-skill/apis/getTripStatus.js
const {
  isPreviewMode,
  successResult,
  errorResult,
  activeTrip
} = require('../utils/util')

async function getTripStatus(params = {}) {
  console.info('[ai-mode] getTripStatus 入口, params=', JSON.stringify(params))
  const { tripId } = (params || {})

  if (!tripId) {
    if (isPreviewMode()) {
      return successResult(
        '当前您有一个进行中的行程。请展示行程状态卡片。',
        {
          trip: {
            tripId: activeTrip.tripId,
            origin: activeTrip.origin,
            destination: activeTrip.destination,
            carType: activeTrip.carType,
            carTypeName: activeTrip.carTypeName,
            price: activeTrip.price,
            status: activeTrip.status,
            statusText: activeTrip.statusText,
            startTime: activeTrip.startTime,
            driverName: activeTrip.driverName,
            plateNumber: activeTrip.plateNumber,
            driverPhone: activeTrip.driverPhone,
            estimatedArrival: activeTrip.estimatedArrival,
            remainingDistance: activeTrip.remainingDistance
          },
          hasActiveTrip: true
        },
        { tripId: activeTrip.tripId }
      )
    }
    return errorResult('请提供行程ID来查询行程状态。')
  }

  if (isPreviewMode()) {
    if (tripId === activeTrip.tripId) {
      return buildResult({
        tripId: activeTrip.tripId,
        origin: activeTrip.origin,
        destination: activeTrip.destination,
        carType: activeTrip.carType,
        carTypeName: activeTrip.carTypeName,
        price: activeTrip.price,
        status: activeTrip.status,
        statusText: activeTrip.statusText,
        startTime: activeTrip.startTime,
        driverName: activeTrip.driverName,
        plateNumber: activeTrip.plateNumber,
        driverPhone: activeTrip.driverPhone,
        estimatedArrival: activeTrip.estimatedArrival,
        remainingDistance: activeTrip.remainingDistance
      })
    }
    return errorResult(
      `未找到行程 ${tripId}。请确认行程 ID 是否正确。`,
      { trip: null, hasActiveTrip: false }
    )
  }

  const { result } = await wx.cloud.callFunction({
    name: 'taxi-skill-handler',
    data: { action: 'getTripStatus', tripId }
  })

  if (result && result.code === 0 && result.data) {
    console.info('[ai-mode] getTripStatus 云函数返回成功')
    return buildResult(result.data)
  }
  return errorResult(result?.message || '请求失败')
}

function buildResult(data) {
  return successResult(
    `行程「${data.origin} → ${data.destination}」当前状态：${data.statusText}。请展示行程状态卡片。`,
    { trip: data, hasActiveTrip: true },
    { tripId: data.tripId, status: data.status }
  )
}

module.exports = getTripStatus
