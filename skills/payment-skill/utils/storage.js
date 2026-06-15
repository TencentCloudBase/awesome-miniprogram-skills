// skills/payment-skill/utils/storage.js
// 支付订单、退款单、转账单的本地存储管理
// 按 openid 命名空间隔离数据

function getOpenid() {
  const userInfo = wx.getStorageSync('userInfo')
  return (userInfo && userInfo.openid) ? userInfo.openid : 'anonymous'
}

// ========== 订单管理 ==========

function getOrders() {
  const openid = getOpenid()
  return wx.getStorageSync(`pay_orders_${openid}`) || []
}

function saveOrder(order) {
  const openid = getOpenid()
  const orders = getOrders()
  const idx = orders.findIndex(o => o.outTradeNo === order.outTradeNo)
  if (idx >= 0) orders[idx] = order
  else orders.push(order)
  wx.setStorageSync(`pay_orders_${openid}`, orders)
}

function findOrder(outTradeNo) {
  const orders = getOrders()
  return orders.find(o => o.outTradeNo === outTradeNo) || null
}

function getLatestOrder() {
  const orders = getOrders()
  if (orders.length === 0) return null
  return orders[orders.length - 1]
}

// ========== 退款管理 ==========

function getRefunds() {
  const openid = getOpenid()
  return wx.getStorageSync(`pay_refunds_${openid}`) || []
}

function saveRefund(refund) {
  const openid = getOpenid()
  const refunds = getRefunds()
  const idx = refunds.findIndex(r => r.outRefundNo === refund.outRefundNo)
  if (idx >= 0) refunds[idx] = refund
  else refunds.push(refund)
  wx.setStorageSync(`pay_refunds_${openid}`, refunds)
}

function findRefund(outRefundNo) {
  const refunds = getRefunds()
  return refunds.find(r => r.outRefundNo === outRefundNo) || null
}

// ========== 转账管理 ==========

function getTransfers() {
  const openid = getOpenid()
  return wx.getStorageSync(`pay_transfers_${openid}`) || []
}

function saveTransfer(transfer) {
  const openid = getOpenid()
  const transfers = getTransfers()
  const idx = transfers.findIndex(t => t.outBillNo === transfer.outBillNo)
  if (idx >= 0) transfers[idx] = transfer
  else transfers.push(transfer)
  wx.setStorageSync(`pay_transfers_${openid}`, transfers)
}

function findTransfer(outBillNo) {
  const transfers = getTransfers()
  return transfers.find(t => t.outBillNo === outBillNo) || null
}

module.exports = {
  getOpenid,
  getOrders,
  saveOrder,
  findOrder,
  getLatestOrder,
  getRefunds,
  saveRefund,
  findRefund,
  getTransfers,
  saveTransfer,
  findTransfer
}
