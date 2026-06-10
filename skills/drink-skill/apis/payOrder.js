// 支付订单
// 规范（最佳实践）：
// - 若微信支付环境不可用，自动降级为 mock 支付成功（与 mcp.json description 一致）
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（不含 imageUrl）
// - _meta：组件渲染用（含 imageUrl），Agent 不可见
const { findOrder, saveOrder, getAddress, isPreviewMode } = require('../utils/storage.js')
const { errorResult } = require('../utils/result.js')

function requestWxPayment(order) {
  return new Promise((resolve, reject) => {
    if (!wx || typeof wx.requestPayment !== 'function') {
      return reject(new Error('当前环境不支持 wx.requestPayment'))
    }
    try {
      wx.requestPayment({
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: 'demo_' + Math.random().toString(36).slice(2, 10),
        package: 'prepay_id=demo_prepay',
        signType: 'MD5',
        paySign: 'demo_sign',
        success: () => resolve(),
        fail: (err) => reject(err || new Error('wx.requestPayment 调用失败'))
      })
    } catch (e) {
      reject(e)
    }
  })
}

function mockPaySuccess(order) {
  order.status = 'paid'
  order.payTime = new Date().toISOString()
  order.payMethod = 'mock'
  saveOrder(order)
  return order
}

async function payOrder({ orderId, address: inputAddress } = {}) {
  try {
    if (!orderId) {
      return { isError: true, content: [{ type: 'text', text: '缺少 orderId。禁止编造，应从 confirmSku/saveAddress 返回值获取。' }] }
    }

    // 预览模式：走本地 storage
    if (isPreviewMode()) {
      const order = findOrder(orderId)
      if (!order) {
        return { isError: true, content: [{ type: 'text', text: `未找到订单 ${orderId}。禁止编造 orderId 再次调用。正确出口：引导用户重新选品下单。` }] }
      }
      if (order.status === 'paid') {
        return {
          isError: false,
          content: [{ type: 'text', text: '该订单已支付完成。接下来为用户展示支付成功卡片。' }],
          structuredContent: {
            orderId,
            paidAmount: order.totalPrice,
            payTime: order.payTime,
            status: 'paid',
            drinkName: order.drinkName,
            specText: order.specText
          },
          _meta: { imageUrl: order.imageUrl || '' }
        }
      }

      if (!order.address) {
        const addr = inputAddress || getAddress()
        if (addr) {
          order.address = addr
          order.status = 'confirmed'
          saveOrder(order)
        } else {
          return {
            isError: true,
            content: [{ type: 'text', text: '订单缺少收货地址，无法发起支付。正确出口：引导用户点击订单确认卡上的"添加收货地址"栏补充地址后再下单。禁止在无地址时再次调用 payOrder。' }]
          }
        }
      }

      let paid
      try {
        await requestWxPayment(order)
        order.status = 'paid'
        order.payTime = new Date().toISOString()
        order.payMethod = 'wxpay'
        saveOrder(order)
        paid = order
      } catch (err) {
        console.warn('[payOrder] wx.requestPayment failed, fallback to mock:', (err && err.errMsg) || err)
        paid = mockPaySuccess(order)
      }

      return {
        isError: false,
        content: [{
          type: 'text',
          text: `支付成功，订单 ${paid.orderId} 已完成（¥${paid.totalPrice}）。接下来为用户展示支付成功卡片，并简短告知用户"支付成功，预计 20 分钟内出杯"。禁止以纯文本重复订单详情。`
        }],
        structuredContent: {
          orderId: paid.orderId,
          paidAmount: paid.totalPrice,
          payTime: paid.payTime,
          status: 'paid',
          drinkName: paid.drinkName,
          specText: paid.specText
        },
        _meta: {
          imageUrl: paid.imageUrl || '',
          address: paid.address,
          payMethod: paid.payMethod
        }
      }
    }

    // 正式模式：先查询订单，再发起支付
    const { result: detailResult } = await wx.cloud.callFunction({
      name: 'drink-skill-handler',
      data: { action: 'getOrderDetail', orderId }
    })
    if (!detailResult || detailResult.code !== 0) {
      return errorResult(detailResult?.message || '查询订单失败')
    }
    const order = detailResult.data
    if (!order) {
      return errorResult(`未找到订单 ${orderId}。禁止编造 orderId 再次调用。正确出口：引导用户重新选品下单。`)
    }
    if (order.status === 'paid') {
      return {
        isError: false,
        content: [{ type: 'text', text: '该订单已支付完成。接下来为用户展示支付成功卡片。' }],
        structuredContent: {
          orderId,
          paidAmount: order.totalPrice,
          payTime: order.payTime,
          status: 'paid',
          drinkName: order.drinkName,
          specText: order.specText
        },
        _meta: { imageUrl: order.imageUrl || '' }
      }
    }
    if (!order.address && !inputAddress) {
      return errorResult('订单缺少收货地址，无法发起支付。正确出口：引导用户点击订单确认卡上的"添加收货地址"栏补充地址后再下单。禁止在无地址时再次调用 payOrder。')
    }

    // 正式模式：调用共享支付云函数获取支付参数
    let payMethod = 'mock'
    let payParams = null
    try {
      const { result: payResult } = await wx.cloud.callFunction({
        name: 'payment-handler',
        data: {
          action: 'createPayment',
          orderId,
          totalAmount: order.totalPrice,
          description: `${order.drinkName} ${order.specText || ''}`,
          skillName: 'drink-skill'
        }
      })
      if (payResult && payResult.code === 0 && payResult.data) {
        payMethod = 'wxpay'
        payParams = payResult.data.payParams
      }
    } catch (err) {
      console.warn('[payOrder] payment-handler failed:', err.message)
    }

    if (!payParams) {
      // 支付服务不可用，降级为 mock 成功
      const payTime = new Date().toISOString()
      await wx.cloud.callFunction({
        name: 'drink-skill-handler',
        data: { action: 'updateOrder', orderId, status: 'paid', payTime, payMethod: 'mock' }
      })
      return {
        isError: false,
        content: [{ type: 'text', text: `支付成功，订单 ${orderId} 已完成（¥${order.totalPrice}）。` }],
        structuredContent: {
          orderId, paidAmount: order.totalPrice, payTime, status: 'paid',
          drinkName: order.drinkName, specText: order.specText
        },
        _meta: { imageUrl: order.imageUrl || '', address: order.address, payMethod: 'mock' }
      }
    }

    // 返回支付参数，由 payment-card 组件调起 wx.requestPayment
    return {
      isError: false,
      content: [{ type: 'text', text: `请确认支付，订单 ${orderId}（¥${order.totalPrice}）。` }],
      structuredContent: {
        orderId, prepayId: payParams.prepayId,
        payParams,
        totalAmount: order.totalPrice
      },
      _meta: { payParams }
    }
  } catch (err) {
    console.error('[payOrder] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `支付失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = payOrder
