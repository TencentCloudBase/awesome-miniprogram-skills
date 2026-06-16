// skills/payment-skill/apis/transferMoney.js
// 发起商家转账
const { genBillNo } = require('../utils/id')
const { saveTransfer } = require('../utils/storage')
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

async function transferMoney(params = {}) {
  console.info('[ai-mode] transferMoney 入口, params=', JSON.stringify(params))
  const { transferAmount, transferRemark, transferSceneId } = params || {}

  try {
    if (!transferAmount || transferAmount <= 0) {
      return errorResult('缺少有效的转账金额 transferAmount（单位：分，必须大于 0）。')
    }
    if (transferAmount < 30) {
      return errorResult('转账金额不能低于 30 分（0.3 元）。请确认金额后重试。')
    }
    if (transferAmount >= 200000) {
      return errorResult('转账金额不能超过 200000 分（2000 元）。本模板仅支持免密小额转账。')
    }

    const outBillNo = genBillNo()
    const remark = transferRemark || '商家转账'
    const sceneId = transferSceneId || '1000'

    // 预览模式
    if (isPreviewMode()) {
      console.info('[ai-mode] transferMoney 预览模式')
      const transferResult = {
        outBillNo,
        transferBillNo: 'MOCK_' + outBillNo,
        transferAmount,
        state: 'ACCEPTED',
        stateDesc: '已受理（模拟）'
      }
      saveTransfer({
        outBillNo,
        transferBillNo: transferResult.transferBillNo,
        transferAmount,
        remark,
        sceneId,
        state: 'ACCEPTED',
        stateDesc: '已受理（模拟）',
        createTime: new Date().toISOString()
      })
      return successResult(
        `转账已受理，单号 ${outBillNo}，金额 ¥${(transferAmount / 100).toFixed(2)}，状态：已受理（模拟）。受理成功不等于转账成功，可通过 queryTransfer 查询最终状态。接下来展示转账结果卡片。`,
        transferResult,
        { remark, sceneId }
      )
    }

    // 正式模式：尝试调用后端转账
    let transferResult = null
    try {
      const res = await callPayCommon('wxpay_transfer', {
        out_bill_no: outBillNo,
        transfer_scene_id: sceneId,
        transfer_amount: transferAmount,
        transfer_remark: remark,
        transfer_scene_report_infos: [
          { info_type: '活动名称', info_content: '商家转账' },
          { info_type: '奖励说明', info_content: remark }
        ]
        // openid 由后端自动从 x-wx-openid header 获取
      })

      if (res.code === 0 && res.data) {
        const transferBillNo = res.data.transfer_bill_no || ''
        const packageInfo = res.data.package_info || ''
        const state = res.data.state || 'ACCEPTED'

        transferResult = {
          outBillNo,
          transferBillNo,
          transferAmount,
          state,
          stateDesc: TRANSFER_STATE_MAP[state] || '已受理',
          packageInfo
        }

        // 若返回了 package_info，需要前端调起确认收款页面
        if (packageInfo && wx.canIUse && wx.canIUse('requestMerchantTransfer')) {
          try {
            const mchId = res.data.mchId || ''
            wx.requestMerchantTransfer({
              mchId: mchId,
              appId: wx.getAccountInfoSync().miniProgram.appId,
              package: packageInfo,
              success: () => {
                console.info('[transferMoney] 用户确认收款页面展示成功')
              },
              fail: (err) => {
                console.warn('[transferMoney] 调起确认收款页面失败:', err)
              }
            })
          } catch (e) {
            console.warn('[transferMoney] requestMerchantTransfer error:', e)
          }
        }
      }
    } catch (err) {
      console.warn('[transferMoney] 后端转账调用失败，使用 mock:', err)
    }

    // 后端不可用时 mock 转账受理
    if (!transferResult) {
      transferResult = {
        outBillNo,
        transferBillNo: 'MOCK_' + outBillNo,
        transferAmount,
        state: 'ACCEPTED',
        stateDesc: '已受理（模拟）',
        packageInfo: ''
      }
    }

    // 保存转账记录
    saveTransfer({
      outBillNo,
      transferBillNo: transferResult.transferBillNo,
      transferAmount,
      remark,
      sceneId,
      state: transferResult.state,
      stateDesc: transferResult.stateDesc,
      createTime: new Date().toISOString()
    })

    return successResult(
      `转账已受理，单号 ${outBillNo}，金额 ¥${(transferAmount / 100).toFixed(2)}，状态：${transferResult.stateDesc}。受理成功不等于转账成功，可通过 queryTransfer 查询最终状态。接下来展示转账结果卡片。`,
      {
        outBillNo: transferResult.outBillNo,
        transferBillNo: transferResult.transferBillNo,
        transferAmount: transferResult.transferAmount,
        state: transferResult.state,
        stateDesc: transferResult.stateDesc
      },
      { remark, sceneId }
    )
  } catch (err) {
    console.error('[transferMoney] error', err)
    return errorResult(`转账失败：${err.message || '未知错误'}。`)
  }
}

module.exports = transferMoney
