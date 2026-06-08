// skills/taxi-skill/apis/estimateTrip.js
const {
  ensureCloudInit,
  successResult,
  errorResult,
  calcTripPrice,
  destinations,
  carTypes
} = require('../utils/util')

async function estimateTrip(params = {}) {
  console.info('[ai-mode] estimateTrip 入口, params=', JSON.stringify(params))
  const { origin, destination, selectedCarType } = (params || {})
  const carTypeId = selectedCarType || params.carType || 'express'

  if (!origin || !destination) {
    return errorResult(
      '请提供出发地和目的地，例如「从望京SOHO到首都机场多少钱」。',
      {
        destinations: destinations.map(d => ({ id: d.id, name: d.name, address: d.address, distance: d.distance })),
        carTypes: carTypes.map(c => ({ id: c.id, name: c.name, desc: c.desc, eta: c.eta })),
        suggestions: ['从望京SOHO到首都机场', '从三里屯到北京南站', '从中关村到望京']
      }
    )
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'estimateTrip', origin, destination, carType: carTypeId }
    })
    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] estimateTrip 云函数返回成功')
      return buildResult(result.data)
    }
  } catch (err) {
    console.error('[ai-mode] estimateTrip 云函数调用失败，降级到种子数据:', err.message)
  }

  const estimate = calcTripPrice(origin, destination, carTypeId)
  const allEstimates = carTypes.map(ct => {
    const e = calcTripPrice(origin, destination, ct.id)
    return { carTypeId: ct.id, carTypeName: ct.name, price: e.price, distance: e.distance, duration: e.duration, desc: ct.desc, eta: ct.eta }
  })
  const current = allEstimates.find(e => e.carTypeId === (carTypeId || 'express'))
  const originObj = destinations.find(d => origin.includes(d.name) || d.name.includes(origin)) || { name: origin, address: '' }
  const destObj = destinations.find(d => destination.includes(d.name) || d.name.includes(destination)) || { name: destination, address: '' }

  return buildResult({
    origin: originObj.name,
    originAddress: originObj.address,
    destination: destObj.name,
    destinationAddress: destObj.address,
    estimates: allEstimates,
    selectedEstimate: current || allEstimates[0]
  })
}

function buildResult(data) {
  return successResult(
    `已估算从「${data.origin}」到「${data.destination}」的行程费用。请展示行程预估卡片，列出各车型价格供用户选择。`,
    {
      origin: data.origin,
      originAddress: data.originAddress,
      destination: data.destination,
      destinationAddress: data.destinationAddress,
      estimates: data.estimates,
      selectedEstimate: data.selectedEstimate
    },
    { origin: data.origin, destination: data.destination }
  )
}

module.exports = estimateTrip
