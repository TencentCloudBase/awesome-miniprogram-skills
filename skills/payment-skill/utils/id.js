// skills/payment-skill/utils/id.js
// ID 生成工具

/**
 * 生成商户订单号（前缀 + 时间戳 + 随机串）
 * 小程序环境无 Web Crypto API，使用毫秒时间戳 + 多段随机拼接降低碰撞概率
 */
function genOutTradeNo() {
  const d = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
  const ms = Date.now().toString(36)
  const r1 = Math.random().toString(36).slice(2, 8)
  const r2 = Math.random().toString(36).slice(2, 6)
  return 'MP' + d + ms.slice(-4) + r1 + r2
}

/**
 * 生成退款单号
 */
function genRefundNo() {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
  const ms = Date.now().toString(36).slice(-4)
  const r1 = Math.random().toString(36).slice(2, 6).toUpperCase()
  const r2 = Math.random().toString(36).slice(2, 6).toUpperCase()
  return ('RF' + timestamp + ms + r1 + r2).slice(0, 30)
}

/**
 * 生成转账单号
 */
function genBillNo() {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
  const ms = Date.now().toString(36).slice(-4)
  const r1 = Math.random().toString(36).slice(2, 6).toUpperCase()
  const r2 = Math.random().toString(36).slice(2, 6).toUpperCase()
  return ('TB' + timestamp + ms + r1 + r2).slice(0, 30)
}

module.exports = { genOutTradeNo, genRefundNo, genBillNo }
