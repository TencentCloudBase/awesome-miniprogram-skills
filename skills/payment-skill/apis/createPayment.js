// skills/payment-skill/apis/createPayment.js
const { isPreviewMode, getOpenid, errorResult, successResult, mockPayParams } = require('../utils/util')

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
    const { result } = await wx.cloud.callFunction({
      name: 'payment-handler',
      data: {
        action: 'createPayment',
        openid: getOpenid(),
        orderId,
        totalAmount,
        description,
        attach,
        skillName
      }
    })

    if (result && result.code === 0 && result.data) {
      const d = result.data
      return successResult(
        `已生成支付订单，金额 ¥${(d.totalAmount || totalAmount).toFixed(2)}。请展示支付卡片引导用户确认支付。`,
        {
          orderId: d.orderId,
          prepayId: d.prepayId,
          payParams: d.payParams,
          totalAmount: d.totalAmount
        },
        { payParams: d.payParams }
      )
    }
    return errorResult(result?.message || '创建支付订单失败')
  } catch (err) {
    console.error('[ai-mode] createPayment error:', err.message)
    return errorResult('创建支付订单失败，请稍后重试')
  }
}

module.exports = createPayment
