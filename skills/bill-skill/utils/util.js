// skills/bill-skill/utils/util.js
const { bills, paymentHistory } = require('../data/seed')

const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'
const CLOUD_ENV_ID = 'cloud1-5g39elugeec5ba0f'
let _cloudInited = false

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false
}

function getOpenid() {
  const userInfo = wx.getStorageSync('userInfo')
  return (userInfo && userInfo.openid) || 'anonymous'
}

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
  _cloudInited = true
}

function errorResult(msg, structuredContent, meta) {
  const result = { isError: true, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function defaultBillList() {
  return bills
    .filter((b) => b.status === 'unpaid')
    .map((b) => ({
      billId: b.billId,
      billType: b.billType,
      billTypeText: b.billTypeText,
      provider: b.provider,
      accountNo: b.accountNo,
      amount: b.amount,
      dueDate: b.dueDate,
      overdue: b.overdue
    }))
}

function defaultBillDetail(billId) {
  return bills.find((b) => b.billId === billId) || null
}

function defaultPaymentHistory() {
  return paymentHistory.map((h) => ({
    historyId: h.historyId,
    billType: h.billType,
    billTypeText: h.billTypeText,
    provider: h.provider,
    accountNo: h.accountNo,
    amount: h.amount,
    payTime: h.payTime,
    payMethod: h.payMethod,
    status: h.status
  }))
}

module.exports = {
  CLOUD_ENV_ID,
  ensureCloudInit,
  errorResult,
  successResult,
  defaultBillList,
  defaultBillDetail,
  defaultPaymentHistory,
  isPreviewMode,
  getOpenid
}
