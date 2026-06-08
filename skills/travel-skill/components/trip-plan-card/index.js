// skills/travel-skill/components/trip-plan-card/index.js
Component({
  data: {
    dest: null,
    transport: [],
    hotels: [],
    activeTab: 'transport'
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] trip-plan-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] trip-plan-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          dest: sc.dest || null,
          transport: sc.transport || [],
          hotels: sc.hotels || []
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] trip-plan-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] trip-plan-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] trip-plan-card overflow monitor=on')
    }
  },
  methods: {
    onSwitchTab(e) {
      const tab = e.currentTarget.dataset.tab
      this.setData({ activeTab: tab })
    },
    onTapWeather(e) {
      const { destId, name } = e.currentTarget.dataset
      console.info(`[ai-mode] trip-plan-card send api/call name=getWeatherInfo args=${JSON.stringify({ destId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `${name}天气` },
          { type: 'api/call', data: { name: 'getWeatherInfo', arguments: { destId } } }
        ]
      })
    },
    onTapBack(e) {
      const { keyword } = e.currentTarget.dataset
      console.info('[ai-mode] trip-plan-card send api/call name=searchDestinations')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '返回目的地列表' },
          { type: 'api/call', data: { name: 'searchDestinations', arguments: { keyword: keyword || '' } } }
        ]
      })
    }
  }
})
