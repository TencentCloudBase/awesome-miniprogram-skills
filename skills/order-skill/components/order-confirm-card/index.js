// skills/order-skill/components/order-confirm-card/index.js
Component({
  data: {
    order: {},
    visibleItems: [],
    omittedCount: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] order-confirm-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const order = sc.order || {}
        const items = order.items || []
        const maxVisible = 3
        const omittedCount = Math.max(items.length - maxVisible, 0)
        order.items = items.slice(0, maxVisible)
        order._omittedCount = omittedCount
        console.info('[ai-mode] order-confirm-card 收到 Result, orderId=', order.orderId, 'items=', items.length, 'visible=', visibleItems.length)
        this.setData({ order })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const dimensions = viewCtx.getDimensions()
        console.info(`[ai-mode] order-confirm-card dimensions width=${dimensions.width} minHeight=${dimensions.minHeight} maxHeight=${dimensions.maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] order-confirm-card getDimensions skipped:', e.message)
      }
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
