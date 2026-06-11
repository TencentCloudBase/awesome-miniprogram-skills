// skills/bill-skill/components/pay-result-card/index.js
const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    orderNo: '',
    billId: '',
    billType: '',
    billTypeText: '',
    provider: '',
    accountNo: '',
    amount: '0.00',
    payTime: '',
    payMethod: '',
    status: 'success'
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] pay-result-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] pay-result-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          orderNo: sc.orderNo || '',
          billId: sc.billId || '',
          billType: sc.billType || '',
          billTypeText: sc.billTypeText || '',
          provider: sc.provider || '',
          accountNo: sc.accountNo || '',
          amount: String(sc.amount || '0.00'),
          payTime: sc.payTime || '',
          payMethod: sc.payMethod || '',
          status: sc.status || 'success'
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] pay-result-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] pay-result-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] pay-result-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] pay-result-card overflow monitor=on')
    },
    attached() {
      // TODO: 以下为 cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && !this.data.payTime) {
        console.info('[ai-mode] pay-result-card 预览模式，展示模拟支付结果')
        this.setData({
          billTypeText: '电费',
          amount: '156.80',
          payTime: '2026-06-11 17:00:00',
          status: 'success',
          orderNo: 'mock_tx_001',
          payMethod: '微信支付'
        })
      }
    }
  },
  methods: {
    onTapViewHistory() {
      console.info('[ai-mode] pay-result-card send api/call name=getPaymentHistory')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看缴费记录' },
          { type: 'api/call', data: { name: 'getPaymentHistory', arguments: {} } }
        ]
      })
    },
    onTapBackList() {
      console.info('[ai-mode] pay-result-card send api/call name=getBills')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '继续缴纳其他账单' },
          { type: 'api/call', data: { name: 'getBills', arguments: {} } }
        ]
      })
    }
  }
})
