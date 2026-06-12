// skills/taxi-skill/utils/util.js
const { destinations, carTypes, historyTrips, activeTrip } = require('../data/seed')

const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) === true
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
  isPreviewMode,
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
