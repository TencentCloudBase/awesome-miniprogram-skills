// skills/taxi-skill/utils/util.js
const { destinations, carTypes, historyTrips, activeTrip } = require('../data/seed')

const CLOUD_ENV_ID = 'cloud1-5g39elugeec5ba0f'
let _cloudInited = false

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
  _cloudInited = true
}

function errorResult(msg, structuredContent, meta) {
  const result = { isError: true, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function calcTripPrice(origin, destination, carTypeId) {
  const carType = carTypes.find(c => c.id === carTypeId) || carTypes[0]
  const distance = Math.floor(Math.random() * 20 + 3)
  const duration = Math.floor(Math.random() * 30 + 10)
  const total = Math.round(carType.basePrice + carType.pricePerKm * distance + carType.pricePerMin * duration)
  return { price: total, distance: distance + 'km', duration: duration + '分钟', carType }
}

function genTripId() {
  return `T${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
}

function formatTime(date) {
  const d = date || new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

module.exports = {
  CLOUD_ENV_ID,
  ensureCloudInit,
  errorResult,
  successResult,
  calcTripPrice,
  genTripId,
  formatTime,
  destinations,
  carTypes,
  historyTrips,
  activeTrip
}
