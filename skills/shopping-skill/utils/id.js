// 订单 ID 生成工具
function genOrderId() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD_${dateStr}_${rand}`
}

module.exports = { genOrderId }
