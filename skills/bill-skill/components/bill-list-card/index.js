// skills/bill-skill/components/bill-list-card/index.js
Component({
  data: {
    items: [],
    total: 0,
    totalAmount: '0.00',
    overdueCount: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] bill-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] bill-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          total: sc.total || 0,
          totalAmount: String(sc.totalAmount || '0.00'),
          overdueCount: sc.overdueCount || 0
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] bill-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] bill-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] bill-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] bill-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapPay(e) {
      const { billId, billTypeText, amount } = e.currentTarget.dataset
      console.info(`[ai-mode] bill-list-card send api/call name=payBill args=${JSON.stringify({ billId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `缴纳${billTypeText} ¥${amount}` },
          { type: 'api/call', data: { name: 'payBill', arguments: { billId } } }
        ]
      })
    }
  }
})
