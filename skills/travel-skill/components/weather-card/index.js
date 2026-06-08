// skills/travel-skill/components/weather-card/index.js
Component({
  data: {
    weather: null,
    destName: ''
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] weather-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] weather-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          weather: sc.weather || null,
          destName: sc.destName || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] weather-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] weather-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] weather-card overflow monitor=on')
    }
  },
  methods: {
    onTapPlan(e) {
      const { destId, name } = e.currentTarget.dataset
      console.info(`[ai-mode] weather-card send api/call name=planTrip args=${JSON.stringify({ destId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `规划${name}行程` },
          { type: 'api/call', data: { name: 'planTrip', arguments: { destId } } }
        ]
      })
    }
  }
})
