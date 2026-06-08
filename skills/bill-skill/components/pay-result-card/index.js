// skills/bill-skill/components/pay-result-card/index.js
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
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] pay-result-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] pay-result-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] pay-result-card overflow monitor=on')
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
