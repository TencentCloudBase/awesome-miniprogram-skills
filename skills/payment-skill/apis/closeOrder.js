// skills/payment-skill/apis/closeOrder.js
// 关闭未支付订单
const { findOrder, saveOrder } = require('../utils/storage')
const { isPreviewMode, errorResult, successResult, callPayCommon } = require('../utils/util')

async function closeOrder(params = {}) {
  console.info('[ai-mode] closeOrder 入口, params=', JSON.stringify(params))
  const { outTradeNo } = params || {}

  try {
    if (!outTradeNo) {
      return errorResult('缺少 outTradeNo。禁止编造，应从 createOrder 返回值获取。')
    }

    const localOrder = findOrder(outTradeNo)
    if (!localOrder) {
      return errorResult(`未找到订单 ${outTradeNo}。禁止编造 outTradeNo。`)
    }

    // 检查本地状态
    if (localOrder.tradeState === 'SUCCESS' || localOrder.status === 'SUCCESS') {
      return errorResult(`订单 ${outTradeNo} 已支付成功，无法关闭。如需取消请走退款流程（调用 refundOrder）。`)
    }

    if (localOrder.tradeState === 'CLOSED') {
      return successResult(
        `订单 ${outTradeNo} 已经是关闭状态，无需重复操作。展示订单状态卡片。`,
        {
          outTradeNo,
          tradeState: 'CLOSED',
          tradeStateDesc: '已关闭',
          closeTime: localOrder.closeTime || new Date().toISOString()
        }
      )
    }

    // 预览模式：本地直接关闭
    if (isPreviewMode()) {
      console.info('[ai-mode] closeOrder 预览模式')
      localOrder.tradeState = 'CLOSED'
      localOrder.tradeStateDesc = '已关闭'
      localOrder.status = 'CLOSED'
      localOrder.closeTime = new Date().toISOString()
      saveOrder(localOrder)
      return successResult(
        `订单 ${outTradeNo} 已成功关闭。接下来为用户展示订单状态卡片，简短告知"订单已关闭"。禁止以纯文本重复订单详情。`,
        {
          outTradeNo,
          tradeState: 'CLOSED',
          tradeStateDesc: '已关闭',
          closeTime: localOrder.closeTime
        }
      )
    }

    // 正式模式：尝试调用后端关闭
    try {
      const res = await callPayCommon('wxpay_close_order', {
        out_trade_no: outTradeNo
      })

      if (res.code !== 0) {
        console.warn('[closeOrder] 后端关单失败:', res.msg)
      }
    } catch (err) {
      console.warn('[closeOrder] 后端不可用，本地关单:', err)
    }

    localOrder.tradeState = 'CLOSED'
    localOrder.tradeStateDesc = '已关闭'
    localOrder.status = 'CLOSED'
    localOrder.closeTime = new Date().toISOString()
    saveOrder(localOrder)

    return successResult(
      `订单 ${outTradeNo} 已成功关闭。接下来为用户展示订单状态卡片，简短告知"订单已关闭"。禁止以纯文本重复订单详情。`,
      {
        outTradeNo,
        tradeState: 'CLOSED',
        tradeStateDesc: '已关闭',
        closeTime: localOrder.closeTime
      }
    )
  } catch (err) {
    console.error('[closeOrder] error', err)
    return errorResult(`关闭订单失败：${err.message || '未知错误'}。`)
  }
}

module.exports = closeOrder
