// skills/order-skill/components/order-confirm-card/index.js
const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    order: {},
    visibleItems: [],
    omittedCount: 0
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容，待 CLI 修复后清理
    attached() {
      if (isPreviewMode() && this.data.order.orderId === undefined) {
        const MOCK_ITEMS = [
          { itemId: 'item_001', name: '巨无霸汉堡', price: 25, quantity: 2, _priceDisplay: '50.0' },
          { itemId: 'item_002', name: '薯条（大）', price: 12, quantity: 1, _priceDisplay: '12.0' },
          { itemId: 'item_003', name: '可乐（大）', price: 8, quantity: 2, _priceDisplay: '16.0' }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { /* 非 CLI 截图环境忽略 */ }
        const items = MOCK_ITEMS.slice(0, maxItems)
        const omittedCount = Math.max(MOCK_ITEMS.length - maxItems, 0)
        console.info('[ai-mode] order-confirm-card 预览模式, maxItems=', maxItems)
        this.setData({
          order: {
            orderId: 'order_001',
            restaurantName: '麦当劳（望京店）',
            items,
            totalAmount: 78,
            deliveryFee: 5,
            address: '北京市朝阳区望京SOHO T1 15层',
            _totalDisplay: '78.0',
            _deliveryFeeDisplay: '5.0',
            _grandTotalDisplay: '83.0',
            _omittedCount: omittedCount
          },
          visibleItems: items,
          omittedCount
        })
      }
    },
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
        order.items = order.items.map(item => ({
          ...item,
          _priceDisplay: Number(item.price * item.quantity).toFixed(1)
        }))
        order._totalDisplay = Number(order.totalAmount || 0).toFixed(1)
        order._deliveryFeeDisplay = Number(order.deliveryFee || 0).toFixed(1)
        order._grandTotalDisplay = (Number(order.totalAmount || 0) + Number(order.deliveryFee || 0)).toFixed(1)
        console.info('[ai-mode] order-confirm-card 收到 Result, orderId=', order.orderId, 'items=', items.length, 'visible=', items.length)
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
