Component({
  data: {
    ticketId: '',
    queueNumber: '--',
    storeName: '',
    aheadCount: 0,
    estimatedMinutes: 0,
    takeTime: '',
    status: 'waiting'
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] queue-ticket-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] queue-ticket-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          ticketId: sc.ticketId || '',
          queueNumber: sc.queueNumber || '--',
          storeName: sc.storeName || '',
          aheadCount: sc.aheadCount || 0,
          estimatedMinutes: sc.estimatedMinutes || 0,
          takeTime: sc.takeTime || '',
          status: sc.status || 'waiting'
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] queue-ticket-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] queue-ticket-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] queue-ticket-card overflow monitor=on')
    }
  },
  methods: {
    onTapViewProgress() {
      if (!this.data.ticketId) return
      const args = { ticketId: this.data.ticketId }
      console.info(`[ai-mode] queue-ticket-card send api/call name=getQueueProgress args=${JSON.stringify(args)}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看进度' },
          { type: 'api/call', data: { name: 'getQueueProgress', arguments: args } }
        ]
      })
    }
  }
})
