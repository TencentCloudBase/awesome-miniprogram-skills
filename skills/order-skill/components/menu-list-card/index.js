// skills/order-skill/components/menu-list-card/index.js
Component({
  data: {
    restaurant: {},
    items: [],
    visibleItems: [],
    omittedCount: 0,
    cart: [],
    cartCount: 0,
    cartTotal: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] menu-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      const viewCtx = wx.modelContext.getViewContext(this)

      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const items = sc.items || []
        console.info('[ai-mode] menu-list-card 收到 Result, items=', items.length)

        // 1:1 容器约 100vw 高，每个紧凑项约 13.33vw，最多显示 4 项
        const maxVisible = 4
        const visibleItems = items.slice(0, maxVisible)
        const omittedCount = Math.max(items.length - maxVisible, 0)

        this.setData({
          restaurant: sc.restaurant || {},
          items,
          visibleItems,
          omittedCount,
          cart: [],
          cartCount: 0,
          cartTotal: 0
        })
        console.info(`[ai-mode] menu-list-card setData total=${items.length} visible=${visibleItems.length} omitted=${omittedCount}`)
      })

      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] menu-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] menu-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapItem(e) {
      const item = e.currentTarget.dataset.item
      const restaurantId = this.data.restaurant.restaurantId || ''
      console.info(`[ai-mode] menu-list-card send api/call name=placeOrder args=${JSON.stringify({restaurantId, items: [item]})}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择 ${item.name}, 下单` },
          { type: 'api/call', data: { name: 'placeOrder', arguments: { restaurantId, items: [item] } } }
        ]
      })
    }
  }
})
