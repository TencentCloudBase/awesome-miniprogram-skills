// skills/bill-skill/components/history-card/index.js
Component({
  data: {
    items: [],
    total: 0,
    totalAmount: '0.00'
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] history-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] history-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          total: sc.total || 0,
          totalAmount: String(sc.totalAmount || '0.00')
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] history-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] history-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] history-card overflow monitor=on')
    }
  },
  methods: {}
})
