// skills/payment-skill/apis/createOrder.js
// 创建支付订单并调起微信支付
const { genOutTradeNo } = require('../utils/id')
const { saveOrder } = require('../utils/storage')
const { isPreviewMode, errorResult, successResult, callPayCommon } = require('../utils/util')

/**
 * 调起微信支付
 */
function requestWxPayment(payData) {
  return new Promise((resolve, reject) => {
    if (!wx || typeof wx.requestPayment !== 'function') {
      return reject(new Error('当前环境不支持 wx.requestPayment'))
    }
    try {
      wx.requestPayment({
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package || ('prepay_id=' + payData.prepay_id),
        signType: payData.signType || 'RSA',
        paySign: payData.paySign,
        success: () => resolve(),
        fail: (err) => reject(err || new Error('wx.requestPayment 调用失败'))
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Mock 支付成功（预览模式 / 环境不可用时降级）
 */
function mockPaySuccess(order) {
  order.status = 'SUCCESS'
  order.tradeState = 'SUCCESS'
  order.tradeStateDesc = '支付成功'
  order.payTime = new Date().toISOString()
  order.payMethod = 'mock'
  saveOrder(order)
  return order
}

async function createOrder(params = {}) {
  console.info('[ai-mode] createOrder 入口, params=', JSON.stringify(params))
  const { description, totalFee } = params || {}

  try {
    if (!description) {
      return errorResult('缺少商品描述 description。')
    }
    if (!totalFee || totalFee <= 0) {
      return errorResult('缺少有效的支付金额 totalFee（单位：分，必须大于 0）。')
    }

    const outTradeNo = genOutTradeNo()

    // 创建本地订单记录
    const order = {
      outTradeNo,
      description,
      totalFee,
      status: 'NOTPAY',
      tradeState: 'NOTPAY',
      tradeStateDesc: '未支付',
      createTime: new Date().toISOString(),
      payMethod: ''
    }
    saveOrder(order)

    // 预览模式：直接返回 mock 成功
    if (isPreviewMode()) {
      console.info('[ai-mode] createOrder 预览模式')
      const paid = mockPaySuccess(order)
      return successResult(
        `支付成功（预览模式），订单 ${paid.outTradeNo}（${paid.description}，¥${(paid.totalFee / 100).toFixed(2)}）已完成。接下来为用户展示支付订单卡片，简短告知用户"支付成功"。禁止以纯文本重复订单详情。`,
        {
          outTradeNo: paid.outTradeNo,
          description: paid.description,
          totalFee: paid.totalFee,
          status: paid.status,
          payTime: paid.payTime,
          payMethod: paid.payMethod
        }
      )
    }

    // 正式模式：调用后端下单
    const res = await callPayCommon('wxpay_order', {
      description,
      out_trade_no: outTradeNo,
      amount: { total: totalFee, currency: 'CNY' }
      // payer.openid 不需要传：后端自动从 x-wx-openid header 获取
    })

    if (res.code !== 0) {
      return errorResult(`下单失败：${res.msg || '后端服务异常'}，请稍后重试。`)
    }

    // 获取支付参数
    const payData = res.data?.data || res.data
    if (!payData) {
      return errorResult('下单失败：未获取到支付参数，请检查后端配置。')
    }

    // 调起微信支付
    try {
      await requestWxPayment(payData)
    } catch (payErr) {
      // 用户取消支付
      if (payErr && payErr.errMsg && payErr.errMsg.includes('cancel')) {
        order.status = 'CANCEL'
        order.tradeStateDesc = '用户取消支付'
        saveOrder(order)
        return successResult(
          `用户取消了支付，订单 ${outTradeNo} 尚未完成。可以告知用户订单未支付，如需继续可再次发起。`,
          {
            outTradeNo,
            description,
            totalFee,
            status: 'CANCEL',
            tradeStateDesc: '用户取消支付'
          }
        )
      }
      // 支付弹窗异常
      return errorResult(`支付调起失败：${payErr.errMsg || payErr.message || '未知错误'}，请重试。`)
    }

    // 支付成功
    order.status = 'SUCCESS'
    order.tradeState = 'SUCCESS'
    order.tradeStateDesc = '支付成功'
    order.payTime = new Date().toISOString()
    order.payMethod = 'wxpay'
    saveOrder(order)

    return successResult(
      `支付成功，订单 ${order.outTradeNo}（${order.description}，¥${(order.totalFee / 100).toFixed(2)}）已完成。接下来为用户展示支付订单卡片，简短告知用户"支付成功"。禁止以纯文本重复订单详情。`,
      {
        outTradeNo: order.outTradeNo,
        description: order.description,
        totalFee: order.totalFee,
        status: order.status,
        payTime: order.payTime,
        payMethod: order.payMethod
      }
    )
  } catch (err) {
    console.error('[createOrder] error', err)
    return errorResult(`下单支付失败：${err.message || '未知错误'}。`)
  }
}

module.exports = createOrder
