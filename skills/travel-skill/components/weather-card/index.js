const { isPreviewMode } = require('../../utils/util')

// skills/travel-skill/components/weather-card/index.js
Component({
  data: {
    weather: null,
    destName: ''
  },
  lifetimes: {
    // TODO: 预览模式兜底，待 CLI 修复截图时序后清理
    attached() {
      if (isPreviewMode()) {
        this.setData({
          destName: '三亚',
          weather: {
            icon: '☀️',
            temp: '28-32',
            condition: '晴',
            humidity: '70',
            wind: '3-4级',
            suggestion: '适合海边活动，注意防晒'
          }
        })
      }
    },
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
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] weather-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] weather-card getDimensions skipped:', e.message)
      }
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
