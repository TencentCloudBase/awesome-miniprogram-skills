// skills/payment-skill/utils/util.js
const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'
const CLOUD_ENV_ID = 'your-env-id'  // 替换为实际云环境 ID
const PAY_COMMON_URL = `https://${CLOUD_ENV_ID}.service.tcloudbase.com/wx-pay`

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) === true
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

/**
 * 调用 pay-common HTTP 云函数
 * @param {string} action - 路由名，如 wxpay_order
 * @param {Object} data - 请求体
 * @returns {Promise<Object>} { code, msg, data }
 */
function callPayCommon(action, data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${PAY_COMMON_URL}/${action}`,
      method: 'POST',
      data,
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          resolve(res.data)
        } else {
          const msg = (res.data && (res.data.msg || res.data.message)) || `HTTP ${res.statusCode}`
          resolve({ code: -1, msg })
        }
      },
      fail: (err) => {
        console.error('[payment-skill] callPayCommon failed:', err)
        reject(err)
      }
    })
  })
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
  errorResult,
  successResult,
  callPayCommon,
  mockPayParams,
  mockQueryResult
}
