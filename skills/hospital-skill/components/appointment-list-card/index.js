Component({
  data: {
    items: []
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] appointment-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] appointment-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || []
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] appointment-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] appointment-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] appointment-list-card overflow monitor=on')
    }
  },
  methods: {
    // 纯展示组件，无上行 tap 交互
  }
})
