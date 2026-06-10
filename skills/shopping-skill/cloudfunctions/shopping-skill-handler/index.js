const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTION = 'shopping_orders'

exports.main = async (event, context) => {
  const { action, openid, ...params } = event

  try {
    switch (action) {
      case 'placeOrder':
        return await placeOrder(openid, params)
      case 'getOrders':
        return await getOrders(openid)
      default:
        return { success: false, errMsg: `未知 action: ${action}` }
    }
  } catch (err) {
    console.error('[shopping-skill-handler] error:', err)
    return { success: false, errMsg: err.message }
  }
}

async function placeOrder(openid, params) {
  const { productId, productName, quantity, totalAmount, storeId, address } = params

  if (!openid || !productId || !productName) {
    return { success: false, errMsg: '缺少必填参数: openid, productId, productName' }
  }

  const order = {
    openid,
    productId,
    productName,
    quantity: quantity || 1,
    totalAmount: totalAmount || 0,
    storeId: storeId || '',
    address: address || '',
    status: 'paid',
    createdAt: db.serverDate()
  }

  const result = await db.collection(COLLECTION).add({ data: order })

  return {
    success: true,
    data: {
      orderId: result._id,
      ...order,
      createdAt: new Date().toISOString()
    }
  }
}

async function getOrders(openid) {
  if (!openid) {
    return { success: false, errMsg: '缺少 openid' }
  }

  const result = await db.collection(COLLECTION)
    .where({ openid })
    .orderBy('createdAt', 'desc')
    .get()

  return {
    success: true,
    data: result.data
  }
}
