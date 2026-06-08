// skills/order-skill/components/order-status-card/index.js
Component({
  data: {
    order: {}
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] order-status-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const order = sc.order || {}
        console.info('[ai-mode] order-status-card 收到 Result, orderId=', order.orderId, 'status=', order.status)
        this.setData({ order })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] order-status-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] order-status-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] order-status-card overflow monitor=on')
    }
  },
  methods: {
    onTapRefresh(e) {
      const { orderId } = e.currentTarget.dataset
      console.info(`[ai-mode] order-status-card send api/call name=getOrderStatus args=${JSON.stringify({ orderId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '刷新配送状态' },
          { type: 'api/call', data: { name: 'getOrderStatus', arguments: { orderId } } }
        ]
      })
    }
  }
})
