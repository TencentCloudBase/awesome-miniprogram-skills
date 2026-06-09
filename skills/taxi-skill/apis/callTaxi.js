// skills/taxi-skill/apis/callTaxi.js
const {
  isPreviewMode,
  successResult,
  errorResult,
  genTripId,
  formatTime,
  carTypes
} = require('../utils/util')

async function callTaxi(params = {}) {
  console.info('[ai-mode] callTaxi 入口, params=', JSON.stringify(params))
  const { origin, destination, carType: carTypeId } = (params || {})

  if (!origin || !destination) {
    return errorResult(
      '请提供出发地和目的地来叫车，例如「帮我叫个快车从望京SOHO到首都机场」。',
      {
        carTypes: carTypes.map(c => ({ id: c.id, name: c.name, desc: c.desc, eta: c.eta }))
      }
    )
  }

  if (isPreviewMode()) {
    return buildResult(buildMockCall(origin, destination, carTypeId))
  }

  const { result } = await wx.cloud.callFunction({
    name: 'taxi-skill-handler',
    data: { action: 'callTaxi', origin, destination, carType: carTypeId }
  })

  if (result && result.code === 0 && result.data) {
    console.info('[ai-mode] callTaxi 云函数返回成功')
    return buildResult(result.data)
  }
  return errorResult(result?.message || '请求失败')
}

function buildMockCall(origin, destination, carTypeId) {
  const carType = carTypes.find(c => c.id === (carTypeId || 'express')) || carTypes[0]
  return {
    tripId: genTripId(),
    origin,
    destination,
    carType: carType.id,
    carTypeName: carType.name,
    price: carType.id === 'express' ? 68 : carType.id === 'premium' ? 98 : 45,
    status: 'calling',
    statusText: '正在为您叫车...',
    callTime: formatTime(),
    estimatedWait: carType.eta,
    driverName: '',
    plateNumber: '',
    driverPhone: ''
  }
}

function buildResult(data) {
  return successResult(
    `已为您呼叫${data.carTypeName}，从「${data.origin}」到「${data.destination}」。请展示叫车状态卡片。`,
    {
      tripId: data.tripId,
      origin: data.origin,
      destination: data.destination,
      carType: data.carType,
      carTypeName: data.carTypeName,
      price: data.price,
      status: data.status,
      statusText: data.statusText,
      callTime: data.callTime,
      estimatedWait: data.estimatedWait,
      driverName: data.driverName,
      plateNumber: data.plateNumber,
      driverPhone: data.driverPhone
    },
    { tripId: data.tripId }
  )
}

module.exports = callTaxi
