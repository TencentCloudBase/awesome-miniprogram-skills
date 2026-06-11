// skills/order-skill/components/menu-list-card/index.js
const { isPreviewMode } = require('../../utils/util')

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
    // TODO: cli agent render 截图时序问题的临时兼容，待 CLI 修复后清理
    attached() {
      if (isPreviewMode() && this.data.items.length === 0) {
        const MOCK_DATA = [
          { itemId: 'item_001', name: '巨无霸汉堡', price: 25, imageUrl: '' },
          { itemId: 'item_002', name: '薯条（大）', price: 12, imageUrl: '' },
          { itemId: 'item_003', name: '可乐（大）', price: 8, imageUrl: '' },
          { itemId: 'item_004', name: '麦辣鸡腿堡', price: 22, imageUrl: '' },
          { itemId: 'item_005', name: '苹果派', price: 7, imageUrl: '' }
        ]
        let maxItems = 4
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(4, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { /* 非 CLI 截图环境忽略 */ }
        console.info('[ai-mode] menu-list-card 预览模式, maxItems=', maxItems)
        const visibleItems = MOCK_DATA.slice(0, maxItems)
        this.setData({
          restaurant: { name: '麦当劳（望京店）', rating: 4.5, monthlySales: 2000 },
          items: MOCK_DATA,
          visibleItems,
          omittedCount: Math.max(MOCK_DATA.length - maxItems, 0)
        })
      }
    },
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
