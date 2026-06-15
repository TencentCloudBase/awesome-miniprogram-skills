// skills/payment-skill/apis/queryOrder.js
// 查询订单状态
const { findOrder, saveOrder } = require('../utils/storage')
const { isPreviewMode, errorResult, successResult, callPayCommon } = require('../utils/util')

const TRADE_STATE_MAP = {
  'SUCCESS': '支付成功',
  'REFUND': '转入退款',
  'NOTPAY': '未支付',
  'CLOSED': '已关闭',
  'REVOKED': '已撤销',
  'USERPAYING': '用户支付中',
  'PAYERROR': '支付失败'
}

async function queryOrder(params = {}) {
  console.info('[ai-mode] queryOrder 入口, params=', JSON.stringify(params))
  const { outTradeNo } = params || {}

  try {
    if (!outTradeNo) {
      return errorResult('缺少 outTradeNo。禁止编造，应从 createOrder 返回值获取。')
    }

    // 预览模式：从本地 storage 读取
    if (isPreviewMode()) {
      console.info('[ai-mode] queryOrder 预览模式')
      const localOrder = findOrder(outTradeNo)
      if (!localOrder) {
        return errorResult(`未找到订单 ${outTradeNo}。禁止编造 outTradeNo，应从 createOrder 返回值获取。`)
      }
      const orderData = {
        outTradeNo: localOrder.outTradeNo,
        transactionId: localOrder.transactionId || '',
        tradeState: localOrder.tradeState || localOrder.status || 'NOTPAY',
        tradeStateDesc: localOrder.tradeStateDesc || TRADE_STATE_MAP[localOrder.tradeState] || '未知状态',
        totalFee: localOrder.totalFee || 0,
        description: localOrder.description || ''
      }
      return successResult(
        `订单 ${orderData.outTradeNo} 当前状态：${orderData.tradeStateDesc}（${orderData.tradeState}），金额 ¥${(orderData.totalFee / 100).toFixed(2)}。接下来为用户展示订单状态卡片。禁止以纯文本重复订单详情。`,
        orderData
      )
    }

    // 正式模式：尝试调用后端查询
    let orderData = null
    try {
      const res = await callPayCommon('wxpay_query_order_by_out_trade_no', {
        out_trade_no: outTradeNo
      })

      if (res.code === 0 && res.data) {
        orderData = {
          outTradeNo: res.data.out_trade_no || outTradeNo,
          transactionId: res.data.transaction_id || '',
          tradeState: res.data.trade_state || 'NOTPAY',
          tradeStateDesc: TRADE_STATE_MAP[res.data.trade_state] || '未知状态',
          totalFee: res.data.amount?.total || 0,
          description: res.data.description || ''
        }

        // 同步更新本地存储
        const localOrder = findOrder(outTradeNo)
        if (localOrder) {
          localOrder.tradeState = orderData.tradeState
          localOrder.tradeStateDesc = orderData.tradeStateDesc
          localOrder.transactionId = orderData.transactionId
          saveOrder(localOrder)
        }
      }
    } catch (err) {
      console.warn('[queryOrder] 后端查询失败，读取本地数据:', err)
    }

    // 后端不可用时从本地 storage 读取
    if (!orderData) {
      const localOrder = findOrder(outTradeNo)
      if (!localOrder) {
        return errorResult(`未找到订单 ${outTradeNo}。禁止编造 outTradeNo，应从 createOrder 返回值获取。`)
      }
      orderData = {
        outTradeNo: localOrder.outTradeNo,
        transactionId: localOrder.transactionId || '',
        tradeState: localOrder.tradeState || localOrder.status || 'NOTPAY',
        tradeStateDesc: localOrder.tradeStateDesc || TRADE_STATE_MAP[localOrder.tradeState] || '未知状态',
        totalFee: localOrder.totalFee || 0,
        description: localOrder.description || ''
      }
    }

    return successResult(
      `订单 ${orderData.outTradeNo} 当前状态：${orderData.tradeStateDesc}（${orderData.tradeState}），金额 ¥${(orderData.totalFee / 100).toFixed(2)}。接下来为用户展示订单状态卡片。禁止以纯文本重复订单详情。`,
      orderData
    )
  } catch (err) {
    console.error('[queryOrder] error', err)
    return errorResult(`查询订单失败：${err.message || '未知错误'}。`)
  }
}

module.exports = queryOrder
