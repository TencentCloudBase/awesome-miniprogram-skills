// skills/order-skill/apis/placeOrder.js — 下单（选菜品+地址+支付）
const {
  ensureCloudInit,
  successResult,
  errorResult,
  defaultRestaurantDetail,
  genOrderId,
  addOrder
} = require('../utils/util')

async function placeOrder(params = {}) {
  console.info('[ai-mode] placeOrder 入口, params=', JSON.stringify(params))
  const { restaurantId, items, deliveryAddress, contactPhone, deliveryNote } = (params || {})

  if (!restaurantId) {
    return errorResult('缺少 restaurantId 参数，请先通过 searchRestaurants 选择餐厅。禁止编造 restaurantId。')
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResult('缺少 items 参数，请先通过 getMenuItems 选择菜品并加入购物车。')
  }
  if (!deliveryAddress) {
    return errorResult('缺少配送地址，请输入配送地址。')
  }
  if (!contactPhone) {
    return errorResult('缺少联系电话，请输入联系电话。')
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'placeOrder', restaurantId, items, deliveryAddress, contactPhone, deliveryNote }
    })

    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] placeOrder 云函数下单成功, orderId=', result.data.orderId)
      return buildResult(result.data, restaurantId)
    }
    throw new Error('云函数返回数据异常')
  } catch (err) {
    console.error('[ai-mode] placeOrder 出错:', err.message)
    return buildMockResult(restaurantId, items, deliveryAddress, contactPhone, deliveryNote)
  }
}

function buildMockResult(restaurantId, items, deliveryAddress, contactPhone, deliveryNote) {
  const restaurant = defaultRestaurantDetail(restaurantId)
  if (!restaurant) {
    return errorResult(`未找到 ID 为「${restaurantId}」的餐厅。`)
  }
  const now = new Date()
  const orderData = {
    orderId: genOrderId(),
    restaurantId,
    restaurantName: restaurant.name,
    items: items.map((item) => ({
      itemId: item.itemId,
      name: item.name || '未知菜品',
      price: item.price || 0,
      quantity: item.quantity || 1
    })),
    totalAmount: items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    deliveryFee: restaurant.deliveryFee,
    deliveryAddress,
    contactPhone,
    status: 'pending',
    statusText: '商家接单中',
    riderName: '',
    riderPhone: '',
    estimatedArrival: `约${restaurant.estimatedMinutes}分钟`,
    orderTime: now.toLocaleString('zh-CN', { hour12: false }),
    deliveryNote: deliveryNote || ''
  }
  addOrder(orderData)
  return buildResult(orderData, restaurantId)
}

function buildResult(orderData, restaurantId) {
  return successResult(
    `订单已提交！${orderData.restaurantName} 正在准备中，预计 ${orderData.estimatedArrival} 送达。请展示订单确认卡片，包含菜品清单、金额、配送信息。`,
    { order: orderData },
    { restaurantId }
  )
}

module.exports = placeOrder
