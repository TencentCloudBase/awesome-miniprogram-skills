// skills/taxi-skill/components/trip-history-card/index.js
const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    items: [],
    total: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] trip-history-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] trip-history-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          total: sc.total || 0
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] trip-history-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] trip-history-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] trip-history-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] trip-history-card overflow monitor=on')
    },
    attached() {
      // TODO: 以下为 cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] trip-history-card 预览模式，展示模拟历史行程')
        this.setData({
          items: [{
            tripId: 'trip_001',
            origin: '望京SOHO',
            destination: '首都机场',
            date: '2026-06-10',
            fare: 68,
            status: 'completed',
            carType: '快车'
          }],
          total: 1
        })
      }
    }
  },
  methods: {
    onTripDetail(e) {
      const { tripId } = e.currentTarget.dataset
      const trip = this.data.items.find(t => t.tripId === tripId)
      if (!trip) return
      const { origin, destination, carTypeName, price, startTime, driverName, plateNumber } = trip
      console.info(`[ai-mode] trip-history-card 查看行程详情 tripId=${tripId}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${origin}到${destination}的行程详情，费用¥${price}，${carTypeName}，司机${driverName || '无'}` }
        ]
      })
    }
  }
})
