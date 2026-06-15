// skills/payment-skill/apis/queryTransfer.js
// 查询转账状态
const { findTransfer, saveTransfer } = require('../utils/storage')
const { isPreviewMode, errorResult, successResult, callPayCommon } = require('../utils/util')

const TRANSFER_STATE_MAP = {
  'ACCEPTED': '已受理',
  'PROCESSING': '转账处理中',
  'TRANSFERING': '转账中',
  'SUCCESS': '转账成功',
  'FAIL': '转账失败',
  'WAIT_USER_CONFIRM': '待用户确认',
  'CANCELLED': '已撤销',
  'CANCELING': '撤销中'
}

async function queryTransfer(params = {}) {
  console.info('[ai-mode] queryTransfer 入口, params=', JSON.stringify(params))
  const { outBillNo } = params || {}

  try {
    if (!outBillNo) {
      return errorResult('缺少 outBillNo。禁止编造，应从 transferMoney 返回值获取。')
    }

    // 预览模式：从本地 storage 读取
    if (isPreviewMode()) {
      console.info('[ai-mode] queryTransfer 预览模式')
      const localTransfer = findTransfer(outBillNo)
      if (!localTransfer) {
        return errorResult(`未找到转账单 ${outBillNo}。禁止编造 outBillNo，应从 transferMoney 返回值获取。`)
      }
      const transferData = {
        outBillNo: localTransfer.outBillNo,
        transferBillNo: localTransfer.transferBillNo || '',
        transferAmount: localTransfer.transferAmount || 0,
        state: localTransfer.state || 'PROCESSING',
        stateDesc: localTransfer.stateDesc || TRANSFER_STATE_MAP[localTransfer.state] || '未知状态'
      }
      return successResult(
        `转账单 ${transferData.outBillNo} 状态：${transferData.stateDesc}，金额 ¥${(transferData.transferAmount / 100).toFixed(2)}。接下来展示转账状态卡片。禁止以纯文本重复详情。`,
        transferData
      )
    }

    // 正式模式：尝试调用后端查询
    let transferData = null
    try {
      const res = await callPayCommon('wxpay_transfer_bill_query', {
        out_bill_no: outBillNo
      })

      if (res.code === 0 && res.data) {
        transferData = {
          outBillNo: res.data.out_bill_no || outBillNo,
          transferBillNo: res.data.transfer_bill_no || '',
          transferAmount: res.data.transfer_amount || 0,
          state: res.data.state || 'PROCESSING',
          stateDesc: TRANSFER_STATE_MAP[res.data.state] || '未知状态'
        }

        // 同步更新本地
        const localTransfer = findTransfer(outBillNo)
        if (localTransfer) {
          localTransfer.state = transferData.state
          localTransfer.stateDesc = transferData.stateDesc
          localTransfer.transferBillNo = transferData.transferBillNo
          saveTransfer(localTransfer)
        }
      }
    } catch (err) {
      console.warn('[queryTransfer] 后端查询失败，读取本地数据:', err)
    }

    // 后端不可用时从本地读取
    if (!transferData) {
      const localTransfer = findTransfer(outBillNo)
      if (!localTransfer) {
        return errorResult(`未找到转账单 ${outBillNo}。禁止编造 outBillNo，应从 transferMoney 返回值获取。`)
      }
      transferData = {
        outBillNo: localTransfer.outBillNo,
        transferBillNo: localTransfer.transferBillNo || '',
        transferAmount: localTransfer.transferAmount || 0,
        state: localTransfer.state || 'PROCESSING',
        stateDesc: localTransfer.stateDesc || TRANSFER_STATE_MAP[localTransfer.state] || '未知状态'
      }
    }

    return successResult(
      `转账单 ${transferData.outBillNo} 状态：${transferData.stateDesc}，金额 ¥${(transferData.transferAmount / 100).toFixed(2)}。接下来展示转账状态卡片。禁止以纯文本重复详情。`,
      transferData
    )
  } catch (err) {
    console.error('[queryTransfer] error', err)
    return errorResult(`查询转账失败：${err.message || '未知错误'}。`)
  }
}

module.exports = queryTransfer
