const { recommendations, friends, parties: seedParties } = require('../data/seed')
const _dynamicParties = [...seedParties]

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

function filterRecommendations(type = '', keyword = '') {
  const q = String(keyword || '').trim().toLowerCase()
  const t = String(type || '').trim()
  let list = [...recommendations]
  if (t) {
    list = list.filter((item) => item.type === t)
  }
  if (q) {
    list = list.filter((item) => {
      const hay = [item.name, item.address, item.typeText, ...(item.keywords || [])]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }
  return list
}

function getRecommendationById(id) {
  return recommendations.find((item) => item.id === id) || null
}

function getFriendList() {
  return friends.map((item) => ({
    friendId: item.friendId,
    name: item.name,
    avatar: item.avatar,
    status: 'pending'
  }))
}

function getPartyById(partyId) {
  return _dynamicParties.find((item) => item.partyId === partyId) || null
}

function addParty(party) {
  _dynamicParties.push(party)
}

function genPartyId() {
  return `P${Date.now().toString(36).toUpperCase()}`
}

function genInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PARTY-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

module.exports = {
  isPreviewMode,
  errorResult,
  successResult,
  filterRecommendations,
  getRecommendationById,
  getFriendList,
  getPartyById,
  addParty,
  genPartyId,
  genInviteCode
}
