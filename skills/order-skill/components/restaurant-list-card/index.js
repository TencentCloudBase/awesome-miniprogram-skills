// skills/order-skill/components/restaurant-list-card/index.js
const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    items: [],
    keyword: ''
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容，待 CLI 修复后清理
    attached() {
      if (isPreviewMode() && this.data.items.length === 0) {
        const MOCK_DATA = [
          { restaurantId: 'rest_001', name: '麦当劳（望京店）', score: 4.5, monthlySales: 2000, deliveryTime: '30分钟', deliveryFee: 5, minimumOrder: 20, distance: '1.2km', tags: ['汉堡', '快餐'], imageUrl: '' },
          { restaurantId: 'rest_002', name: '麦当劳（国贸店）', score: 4.3, monthlySales: 1800, deliveryTime: '25分钟', deliveryFee: 4, minimumOrder: 20, distance: '2.8km', tags: ['汉堡', '快餐'], imageUrl: '' },
          { restaurantId: 'rest_003', name: '麦当劳（三里屯店）', score: 4.6, monthlySales: 2200, deliveryTime: '35分钟', deliveryFee: 6, minimumOrder: 25, distance: '4.1km', tags: ['汉堡', '快餐'], imageUrl: '' }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { /* 非 CLI 截图环境忽略 */ }
        console.info('[ai-mode] restaurant-list-card 预览模式, maxItems=', maxItems)
        this.setData({
          items: MOCK_DATA.slice(0, maxItems),
          total: maxItems,
          keyword: ''
        })
      }
    },
    created() {
      console.info('[ai-mode] restaurant-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] restaurant-list-card 收到 Result, items=', (sc.items || []).length)
        this.setData({
          items: sc.items || [],
          keyword: sc.keyword || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] restaurant-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] restaurant-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] restaurant-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] restaurant-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapMenu(e) {
      const { restaurantId, restaurantName } = e.currentTarget.dataset
      console.info(`[ai-mode] restaurant-list-card send api/call name=getMenuItems args=${JSON.stringify({ restaurantId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${restaurantName}菜单` },
          { type: 'api/call', data: { name: 'getMenuItems', arguments: { restaurantId } } }
        ]
      })
    }
  }
})
