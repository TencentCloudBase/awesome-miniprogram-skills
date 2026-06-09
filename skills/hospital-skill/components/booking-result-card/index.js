Component({
  data: {
    appointment: null
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] booking-result-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] booking-result-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          appointment: sc.appointment || null
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] booking-result-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] booking-result-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] booking-result-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] booking-result-card overflow monitor=on')
    }
  },
  methods: {
    onTapViewRecords() {
      console.info('[ai-mode] booking-result-card send api/call name=getMyAppointments')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看我的挂号记录' },
          { type: 'api/call', data: { name: 'getMyAppointments', arguments: {} } }
        ]
      })
    }
  }
})
