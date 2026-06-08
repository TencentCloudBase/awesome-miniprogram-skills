// skills/taxi-skill/apis/callTaxi.js
const {
  ensureCloudInit,
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

  const carType = carTypes.find(c => c.id === (carTypeId || 'express')) || carTypes[0]

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'callTaxi', origin, destination, carType: carTypeId }
    })
    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] callTaxi 云函数返回成功')
      return buildResult(result.data)
    }
  } catch (err) {
    console.error('[ai-mode] callTaxi 云函数调用失败，降级到种子数据:', err.message)
  }

  const tripId = genTripId()
  const now = formatTime()

  return buildResult({
    tripId,
    origin,
    destination,
    carType: carType.id,
    carTypeName: carType.name,
    price: carType.id === 'express' ? 68 : carType.id === 'premium' ? 98 : 45,
    status: 'calling',
    statusText: '正在为您叫车...',
    callTime: now,
    estimatedWait: carType.eta,
    driverName: '',
    plateNumber: '',
    driverPhone: ''
  })
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
