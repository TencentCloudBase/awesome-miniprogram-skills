// drink-skill-handler 云函数：统一处理饮品订单和地址的 CRUD
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const ORDERS_COLLECTION = 'drink_orders'
const ADDRESSES_COLLECTION = 'drink_addresses'

exports.main = async (event, context) => {
  const { action, openid, ...payload } = event

  // 从微信上下文获取 openid（优先于参数传入，防止伪造）
  const wxOpenid = cloud.getWXContext().OPENID
  const uid = wxOpenid || openid || 'anonymous'

  try {
    switch (action) {
      case 'placeOrder':
        return await placeOrder(uid, payload)
      case 'getOrders':
        return await getOrders(uid, payload)
      case 'getOrderDetail':
        return await getOrderDetail(uid, payload)
      case 'saveAddress':
        return await saveAddress(uid, payload)
      case 'getAddress':
        return await getAddress(uid)
      case 'updateOrder':
        return await updateOrder(uid, payload)
      default:
        return { code: -1, message: `未知 action: ${action}` }
    }
  } catch (err) {
    console.error('[drink-skill-handler] error', err)
    return { code: -1, message: err.message || '服务器错误' }
  }
}

// 创建订单
async function placeOrder(uid, payload) {
  const { orderId, drinkId, drinkName, specs, basePrice, extraPrice, totalPrice, specText, quantity, totalAmount, address } = payload
  if (!orderId || !drinkId) {
    return { code: -1, message: '缺少 orderId 或 drinkId' }
  }

  const order = {
    orderId: String(orderId),
    openid: uid,
    drinkId: Number(drinkId),
    drinkName: drinkName || '',
    basePrice: basePrice || 0,
    extraPrice: extraPrice || 0,
    totalPrice: totalPrice || totalAmount || 0,
    specs: specs || {},
    specText: specText || '',
    quantity: quantity || 1,
    address: address || null,
    status: address ? 'confirmed' : 'pending',
    createTime: db.serverDate()
  }

  await db.collection(ORDERS_COLLECTION).add({ data: order })
  return { code: 0, message: '订单创建成功', data: order }
}

// 查询订单列表
async function getOrders(uid, payload) {
  const { status } = payload || {}
  const condition = { openid: uid }
  if (status) condition.status = status

  const result = await db.collection(ORDERS_COLLECTION)
    .where(condition)
    .orderBy('createTime', 'desc')
    .limit(50)
    .get()

  return { code: 0, message: 'success', data: result.data }
}

// 查询订单详情
async function getOrderDetail(uid, payload) {
  const { orderId } = payload || {}
  if (!orderId) {
    return { code: -1, message: '缺少 orderId' }
  }
  const result = await db.collection(ORDERS_COLLECTION)
    .where({ openid: uid, orderId: String(orderId) })
    .get()

  if (!result.data || result.data.length === 0) {
    return { code: -1, message: '订单未找到' }
  }
  return { code: 0, message: 'success', data: result.data[0] }
}

// 保存地址
async function saveAddress(uid, payload) {
  const { name, phone, detail } = payload || {}
  if (!name || !phone || !detail) {
    return { code: -1, message: '缺少地址信息（name/phone/detail）' }
  }

  const address = {
    openid: uid,
    name: String(name).trim(),
    phone: String(phone).trim(),
    detail: String(detail).trim(),
    updateTime: db.serverDate()
  }

  // upsert: 删除旧记录后插入新记录
  await db.collection(ADDRESSES_COLLECTION)
    .where({ openid: uid })
    .remove()
  await db.collection(ADDRESSES_COLLECTION).add({ data: address })

  return { code: 0, message: '地址保存成功', data: address }
}

// 查询地址
async function getAddress(uid) {
  const result = await db.collection(ADDRESSES_COLLECTION)
    .where({ openid: uid })
    .limit(1)
    .get()

  return {
    code: 0,
    message: 'success',
    data: result.data && result.data.length > 0 ? result.data[0] : null
  }
}

// 更新订单状态/地址
async function updateOrder(uid, payload) {
  const { orderId, status, address, payTime, payMethod } = payload || {}
  if (!orderId) {
    return { code: -1, message: '缺少 orderId' }
  }

  const updateData = {}
  if (status) updateData.status = status
  if (address) updateData.address = address
  if (payTime) updateData.payTime = payTime
  if (payMethod) updateData.payMethod = payMethod
  updateData.updateTime = db.serverDate()

  await db.collection(ORDERS_COLLECTION)
    .where({ openid: uid, orderId: String(orderId) })
    .update({ data: updateData })

  return { code: 0, message: '订单更新成功' }
}
