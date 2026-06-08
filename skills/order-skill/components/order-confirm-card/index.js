// skills/order-skill/components/order-confirm-card/index.js
Component({
  data: {
    order: {}
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] order-confirm-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const order = sc.order || {}
        console.info('[ai-mode] order-confirm-card 收到 Result, orderId=', order.orderId)
        this.setData({ order })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] order-confirm-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] order-confirm-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] order-confirm-card overflow monitor=on')
    }
  },
  methods: {
    onTapTrack(e) {
      const { orderId } = e.currentTarget.dataset
      console.info(`[ai-mode] order-confirm-card send api/call name=getOrderStatus args=${JSON.stringify({ orderId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看配送状态' },
          { type: 'api/call', data: { name: 'getOrderStatus', arguments: { orderId } } }
        ]
      })
    }
  }
})
