// skills/bill-skill/apis/payBill.js
const { isPreviewMode, defaultBillDetail, successResult, errorResult, getOpenid } = require('../utils/util')

async function payBill(params) {
  try {
    const { billId } = (params && params.arguments) || params || {}
    if (!billId) {
      return errorResult('请选择要缴费的账单', null, {
        suggestion: { action: 'getBills', reason: '缺少 billId，需要先查询待缴账单' }
      })
    }

    console.info('[ai-mode] [bill-skill] payBill called billId=', billId)

    if (isPreviewMode()) {
      const bill = defaultBillDetail(billId)
      if (!bill) {
        return errorResult('未找到该账单信息')
      }
      if (bill.status !== 'unpaid') {
        return errorResult('该账单已缴费，无需重复支付')
      }

      const payTime = new Date().toISOString()
      const orderNo = `PAY${Date.now()}${String(Math.random()).slice(2, 8)}`

      const msg = `缴费成功！${bill.billTypeText} ¥${bill.amount.toFixed(2)} 已支付完成`

      return successResult(msg, {
        orderNo,
        billId: bill.billId,
        billType: bill.billType,
        billTypeText: bill.billTypeText,
        provider: bill.provider,
        accountNo: bill.accountNo,
        amount: bill.amount,
        payTime,
        payMethod: '微信支付',
        status: 'success'
      })
    }

    // 正式模式：调共享支付云函数
    const bill = defaultBillDetail(billId)
    if (!bill) {
      return errorResult('未找到该账单信息')
    }
    if (bill.status !== 'unpaid') {
      return errorResult('该账单已缴费，无需重复支付')
    }
    const { result } = await wx.cloud.callFunction({
      name: 'payment-handler',
      data: {
        action: 'createPayment',
        orderId: bill.billId,
        totalAmount: bill.amount,
        description: bill.billTypeText,
        skillName: 'bill-skill'
      }
    })
    if (result && result.code === 0) {
      const d = result.data
      return successResult(
        `请确认支付，${bill.billTypeText} ¥${bill.amount.toFixed(2)}。`,
        { orderId: d.orderId, prepayId: d.prepayId, payParams: d.payParams, totalAmount: d.totalAmount },
        { payParams: d.payParams }
      )
    }
    return errorResult(result?.message || '支付失败')
  } catch (err) {
    console.error('[ai-mode] [bill-skill] payBill error:', err.message)
    return errorResult('支付失败，请稍后重试')
  }
}

module.exports = payBill
