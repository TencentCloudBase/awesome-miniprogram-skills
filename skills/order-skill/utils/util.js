// skills/order-skill/utils/util.js — 工具函数
const { restaurants, orders: seedOrders } = require('../data/seed')

const CLOUD_ENV_ID = 'cloud1-5g39elugeec5ba0f'
let _cloudInited = false

// 运行时动态订单池，placeOrder 生成的订单会追加到这里
const _dynamicOrders = [...seedOrders]

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
  CLOUD_ENV_ID,
  ensureCloudInit,
  errorResult,
  successResult,
  defaultRestaurantList,
  defaultRestaurantDetail,
  defaultOrderList,
  defaultOrderDetail,
  addOrder,
  genOrderId
}
