// skills/taxi-skill/components/trip-history-card/index.js
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
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] trip-history-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] trip-history-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] trip-history-card overflow monitor=on')
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
