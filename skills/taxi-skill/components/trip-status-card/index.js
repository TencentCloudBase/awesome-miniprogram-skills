// skills/taxi-skill/components/trip-status-card/index.js
Component({
  data: {
    trip: null,
    hasActiveTrip: false
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] trip-status-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] trip-status-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          trip: sc.trip || null,
          hasActiveTrip: sc.hasActiveTrip || false
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] trip-status-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] trip-status-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] trip-status-card overflow monitor=on')
    }
  },
  methods: {
    onRefresh() {
      const tripId = (this.data.trip && this.data.trip.tripId) || ''
      console.info(`[ai-mode] trip-status-card send api/call name=getTripStatus args=${JSON.stringify({ tripId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '刷新行程状态' },
          { type: 'api/call', data: { name: 'getTripStatus', arguments: { tripId } } }
        ]
      })
    }
  }
})
