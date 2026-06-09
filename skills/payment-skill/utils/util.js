// skills/payment-skill/utils/util.js
const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
}

function getOpenid() {
  const userInfo = wx.getStorageSync('userInfo')
  return (userInfo && userInfo.openid) || 'anonymous'
}

function errorResult(msg) {
  return { isError: true, content: [{ type: 'text', text: msg }] }
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function mockPayParams(orderId, totalAmount) {
  return {
    orderId,
    prepayId: 'mock_prepay_' + Date.now(),
    payParams: {
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: Math.random().toString(36).slice(2, 18),
      package: 'prepay_id=mock_prepay',
      signType: 'RSA',
      paySign: 'mock_sign_' + Math.random().toString(36).slice(2, 18)
    },
    totalAmount
  }
}

function mockQueryResult(orderId) {
  return {
    orderId,
    status: 'success',
    payTime: new Date().toISOString(),
    transactionId: 'mock_transaction_' + Date.now().toString(36).toUpperCase()
  }
}

module.exports = {
  isPreviewMode,
  getOpenid,
  errorResult,
  successResult,
  mockPayParams,
  mockQueryResult
}
