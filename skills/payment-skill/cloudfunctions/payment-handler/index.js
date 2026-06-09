// payment-handler 云函数 — 共享支付服务，供 payment-skill 及其他业务 Skill 调用
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { action, openid, orderId, totalAmount, description, attach, skillName } = event
  console.log('[payment-handler] action=', action, 'orderId=', orderId)

  try {
    switch (action) {
      case 'createPayment':
        return await createPayment(openid, orderId, totalAmount, description, attach, skillName)
      case 'queryPayment':
        return await queryPayment(openid, orderId)
      default:
        return { code: -1, message: `未知 action: ${action}` }
    }
  } catch (err) {
    console.error('[payment-handler] error:', err)
    return { code: -1, message: err.message || '服务器错误' }
  }
}

async function createPayment(openid, orderId, totalAmount, description, attach, skillName) {
  if (!openid) return { code: -1, message: 'openid 不能为空' }
  if (!orderId || !totalAmount || !description || !skillName) {
    return { code: -1, message: '缺少必填参数' }
  }

  // 幂等检查：同一 orderId 返回相同 prepay_id
  const existing = await db.collection('payment_records')
    .where({ orderId })
    .limit(1)
    .get()
  if (existing.data && existing.data.length > 0) {
    const record = existing.data[0]
    return buildPaymentResult(record)
  }

  const amountInCents = Math.round(totalAmount * 100)  // 元转分
  const now = Date.now()
  const prepayId = `wx${now.toString(16)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  // 组装调起支付参数
  const timeStamp = String(Math.floor(now / 1000))
  const nonceStr = Math.random().toString(36).slice(2, 18)
  const packageStr = `prepay_id=${prepayId}`
  const signType = 'RSA'
  const paySign = `SIGN_${prepayId}_${nonceStr}`  // 真实场景由微信支付 SDK 生成

  const record = {
    openid,
    orderId,
    skillName: skillName || '',
    totalAmount: amountInCents,
    description: description || '',
    prepayId,
    status: 'pending',
    createTime: db.serverDate()
  }

  await db.collection('payment_records').add({ data: record })

  return {
    code: 0,
    message: 'success',
    data: {
      orderId,
      prepayId,
      payParams: { timeStamp, nonceStr, package: packageStr, signType, paySign },
      totalAmount
    }
  }
}

async function queryPayment(openid, orderId) {
  if (!orderId) return { code: -1, message: 'orderId 不能为空' }

  const result = await db.collection('payment_records')
    .where({ orderId })
    .limit(1)
    .get()

  if (!result.data || result.data.length === 0) {
    return { code: 0, message: 'success', data: { orderId, status: 'pending', payTime: '', transactionId: '' } }
  }

  const record = result.data[0]
  return {
    code: 0,
    message: 'success',
    data: {
      orderId: record.orderId,
      status: record.status || 'pending',
      payTime: record.payTime || '',
      transactionId: record.transactionId || ''
    }
  }
}

function buildPaymentResult(record) {
  const totalAmount = (record.totalAmount || 0) / 100  // 分转元
  const timeStamp = String(Math.floor(Date.now() / 1000))
  const nonceStr = Math.random().toString(36).slice(2, 18)
  const packageStr = `prepay_id=${record.prepayId}`
  return {
    code: 0,
    message: 'success',
    data: {
      orderId: record.orderId,
      prepayId: record.prepayId,
      payParams: { timeStamp, nonceStr, package: packageStr, signType: 'RSA', paySign: `SIGN_${record.prepayId}_${nonceStr}` },
      totalAmount
    }
  }
}
