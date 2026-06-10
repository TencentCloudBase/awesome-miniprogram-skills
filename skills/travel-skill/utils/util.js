// skills/travel-skill/utils/util.js
const { destinations, weatherData, travelTips } = require('../data/seed')

const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
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

function defaultDestinations(keyword) {
  const q = String(keyword || '').trim().toLowerCase()
  if (!q) return destinations.map(mapDestItem)
  return destinations
    .filter((d) => {
      const hay = [d.name, d.nameEn, d.description, ...(d.tags || [])].join(' ').toLowerCase()
      return hay.includes(q)
    })
    .map(mapDestItem)
}

function mapDestItem(d) {
  return {
    destId: d.destId,
    name: d.name,
    nameEn: d.nameEn,
    cover: d.cover,
    rating: d.rating,
    description: d.description,
    bestSeason: d.bestSeason,
    bestSeasonDesc: d.bestSeasonDesc,
    tags: d.tags
  }
}

function defaultDestDetail(destId) {
  return destinations.find((d) => d.destId === destId) || null
}

function defaultWeather(destId) {
  return weatherData[destId] || null
}

function defaultTips() {
  return travelTips
}

module.exports = {
  isPreviewMode,
  errorResult,
  successResult,
  defaultDestinations,
  defaultDestDetail,
  defaultWeather,
  defaultTips
}
