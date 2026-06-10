// skills/payment-skill/apis/createPayment.js
const { isPreviewMode, errorResult, successResult, mockPayParams, callPayCommon } = require('../utils/util')

async function createPayment(params = {}) {
  console.info('[ai-mode] createPayment 入口, params=', JSON.stringify(params))
  const { orderId, totalAmount, description, attach, skillName } = params || {}

  if (!orderId || totalAmount === undefined || totalAmount === null || !description || !skillName) {
    return errorResult('缺少必填参数（orderId/totalAmount/description/skillName）。请确认已生成业务订单后调用。')
  }

  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return errorResult('订单金额无效，请确认 totalAmount 为正数（单位：元）。')
  }

  if (isPreviewMode()) {
    console.info('[ai-mode] createPayment 预览模式')
    const data = mockPayParams(orderId, totalAmount)
    return successResult(
      `已生成支付订单，金额 ¥${totalAmount.toFixed(2)}。请展示支付卡片引导用户确认支付。`,
      { orderId: data.orderId, prepayId: data.prepayId, payParams: data.payParams, totalAmount: data.totalAmount },
      { payParams: data.payParams }
    )
  }

  try {
    const amountInCents = Math.round(totalAmount * 100)
    const result = await callPayCommon('wxpay_order', {
      out_trade_no: orderId,
      description,
      amount: { total: amountInCents, currency: 'CNY' },
      attach,
      skill_name: skillName
    })

    if (result && result.code === 0 && result.data) {
      const d = result.data
      const payParams = {
        timeStamp: d.timeStamp,
        nonceStr: d.nonceStr,
        package: d.package,
        signType: d.signType || 'RSA',
        paySign: d.paySign
      }
      return successResult(
        `已生成支付订单，金额 ¥${totalAmount.toFixed(2)}。请展示支付卡片引导用户确认支付。`,
        { orderId, prepayId: d.prepay_id, payParams, totalAmount },
        { payParams }
      )
    }
    return errorResult(result?.msg || result?.message || '创建支付订单失败')
  } catch (err) {
    console.error('[ai-mode] createPayment error:', err.message)
    return errorResult('创建支付订单失败，请稍后重试')
  }
}

module.exports = createPayment
