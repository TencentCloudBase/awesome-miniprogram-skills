// skills/order-skill/apis/getOrderStatus.js — 查询订单配送状态
const {
  ensureCloudInit,
  successResult,
  errorResult,
  defaultOrderDetail
} = require('../utils/util')

async function getOrderStatus(params = {}) {
  console.info('[ai-mode] getOrderStatus 入口, params=', JSON.stringify(params))
  const orderId = params && params.orderId

  if (!orderId) {
    return errorResult('缺少 orderId 参数，请先完成下单或提供真实订单号。禁止编造 orderId。')
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'getOrderStatus', orderId }
    })

    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] getOrderStatus 云函数返回, status=', result.data.status)
      return buildResult(result.data)
    }
    throw new Error('云函数返回数据异常')
  } catch (err) {
    console.error('[ai-mode] getOrderStatus 出错:', err.message)
    const order = defaultOrderDetail(orderId)
    if (!order) {
      return errorResult(`未找到订单「${orderId}」。请确认订单号是否正确。`)
    }
    return buildResult(order)
  }
}

function buildResult(order) {
  return successResult(
    `订单 ${order.orderId} 当前状态：${order.statusText}。请展示订单配送状态卡片。`,
    { order },
    { orderId: order.orderId }
  )
}

module.exports = getOrderStatus
