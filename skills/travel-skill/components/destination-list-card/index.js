// skills/travel-skill/components/destination-list-card/index.js
Component({
  data: {
    items: [],
    keyword: ''
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] destination-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] destination-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          keyword: sc.keyword || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] destination-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] destination-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] destination-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] destination-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapPlan(e) {
      const { destId, name } = e.currentTarget.dataset
      console.info(`[ai-mode] destination-list-card send api/call name=planTrip args=${JSON.stringify({ destId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `规划${name}行程` },
          { type: 'api/call', data: { name: 'planTrip', arguments: { destId } } }
        ]
      })
    },
    onTapWeather(e) {
      const { destId, name } = e.currentTarget.dataset
      console.info(`[ai-mode] destination-list-card send api/call name=getWeatherInfo args=${JSON.stringify({ destId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `${name}天气` },
          { type: 'api/call', data: { name: 'getWeatherInfo', arguments: { destId } } }
        ]
      })
    }
  }
})
