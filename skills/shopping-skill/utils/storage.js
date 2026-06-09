// storage 工具：本地存储管理 + seed 数据注入
const { PRODUCTS, STORES, ORDERS } = require('../data/seed.js')

const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
}

const PRODUCTS_KEY = 'shopping_products'
const STORES_KEY = 'shopping_stores'
const ORDERS_KEY = 'shopping_orders'
const VERSION_KEY = 'shopping_version'
const SEED_VERSION = 1

function ensureSeeded() {
  const version = wx.getStorageSync(VERSION_KEY)
  if (version !== SEED_VERSION) {
    wx.setStorageSync(PRODUCTS_KEY, PRODUCTS)
    wx.setStorageSync(STORES_KEY, STORES)
    wx.setStorageSync(ORDERS_KEY, ORDERS)
    wx.setStorageSync(VERSION_KEY, SEED_VERSION)
    console.log('[shopping-skill][storage] seed data injected v' + SEED_VERSION)
  }
}

function getProducts() {
  ensureSeeded()
  return wx.getStorageSync(PRODUCTS_KEY) || PRODUCTS
}

function getStores() {
  ensureSeeded()
  return wx.getStorageSync(STORES_KEY) || STORES
}

function findProduct(productId) {
  const products = getProducts()
  return products.find(p => p.id === Number(productId)) || null
}

function findStore(storeId) {
  const stores = getStores()
  return stores.find(s => s.id === Number(storeId)) || null
}

function getOrders() {
  ensureSeeded()
  return wx.getStorageSync(ORDERS_KEY) || ORDERS
}

function saveOrder(order) {
  const orders = getOrders()
  orders.push(order)
  wx.setStorageSync(ORDERS_KEY, orders)
}

function getOpenid() {
  const userInfo = wx.getStorageSync('userInfo')
  return (userInfo && userInfo.openid) || 'anonymous'
}

module.exports = {
  isPreviewMode,
  getProducts,
  getStores,
  findProduct,
  findStore,
  getOrders,
  saveOrder,
  getOpenid
}
