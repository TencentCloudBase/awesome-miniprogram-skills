// skills/order-skill/utils/util.js — 工具函数
const { restaurants, orders: seedOrders } = require('../data/seed')

const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
}

// 运行时动态订单池，placeOrder 生成的订单会追加到这里
const _dynamicOrders = [...seedOrders]

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

function defaultRestaurantList(keyword) {
  const q = String(keyword || '').trim().toLowerCase()
  const list = q
    ? restaurants.filter((r) => {
        const hay = [r.name, ...(r.tags || []), ...(r.keywords || [])].join(' ').toLowerCase()
        return hay.includes(q)
      })
    : restaurants
  return list.map((r) => ({
    restaurantId: r.restaurantId,
    name: r.name,
    rating: r.rating,
    monthlySales: r.monthlySales,
    distance: r.distance,
    deliveryFee: r.deliveryFee,
    estimatedMinutes: r.estimatedMinutes,
    tags: r.tags,
    minOrder: r.minOrder,
    status: r.status
  }))
}

function defaultRestaurantDetail(restaurantId) {
  return restaurants.find((r) => r.restaurantId === restaurantId) || null
}

function defaultOrderList() {
  return _dynamicOrders.map((o) => ({ ...o }))
}

function defaultOrderDetail(orderId) {
  return _dynamicOrders.find((o) => o.orderId === orderId) || null
}

function addOrder(order) {
  _dynamicOrders.push(order)
}

function genOrderId() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `OD${date}${rand}`
}

module.exports = {
  isPreviewMode,
  errorResult,
  successResult,
  defaultRestaurantList,
  defaultRestaurantDetail,
  defaultOrderList,
  defaultOrderDetail,
  addOrder,
  genOrderId
}
