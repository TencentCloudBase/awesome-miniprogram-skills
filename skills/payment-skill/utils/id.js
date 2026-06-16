// skills/payment-skill/utils/id.js
// ID 生成工具

/**
 * 自增计数器（同一毫秒内递增，避免高频调用碰撞）
 */
let _lastMs = 0
let _seq = 0

function getSeq() {
  const now = Date.now()
  if (now === _lastMs) {
    _seq++
  } else {
    _lastMs = now
    _seq = 0
  }
  return _seq
}

/**
 * 生成商户订单号（前缀 + 时间戳 + 计数器 + 随机串）
 * 格式：MP + yyyyMMddHHmmss + 毫秒base36(4位) + 计数器base36(2位) + 随机(8位)
 * 碰撞防护：毫秒级时间戳 + 自增计数器 + 8位随机 base36
 */
function genOutTradeNo() {
  const d = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
  const ms = Date.now().toString(36).slice(-4)
  const seq = getSeq().toString(36).padStart(2, '0').slice(-2)
  const r = Math.random().toString(36).slice(2, 10)
  return 'MP' + d + ms + seq + r
}

/**
 * 生成退款单号
 */
function genRefundNo() {
  const d = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
  const ms = Date.now().toString(36).slice(-4)
  const seq = getSeq().toString(36).padStart(2, '0').slice(-2)
  const r = Math.random().toString(36).slice(2, 10).toUpperCase()
  return ('RF' + d + ms + seq + r).slice(0, 32)
}

/**
 * 生成转账单号
 */
function genBillNo() {
  const d = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
  const ms = Date.now().toString(36).slice(-4)
  const seq = getSeq().toString(36).padStart(2, '0').slice(-2)
  const r = Math.random().toString(36).slice(2, 10).toUpperCase()
  return ('TB' + d + ms + seq + r).slice(0, 32)
}

module.exports = { genOutTradeNo, genRefundNo, genBillNo }
