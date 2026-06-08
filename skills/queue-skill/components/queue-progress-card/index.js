Component({
  data: {
    ticketId: '',
    queueNumber: '--',
    storeName: '',
    status: 'waiting',
    statusText: '排队中',
    aheadCount: 0,
    currentCallingNumber: '--',
    remainingMinutes: 0,
    isAlmostReady: false
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] queue-progress-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] queue-progress-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          ticketId: sc.ticketId || '',
          queueNumber: sc.queueNumber || '--',
          storeName: sc.storeName || '',
          status: sc.status || 'waiting',
          statusText: sc.statusText || '排队中',
          aheadCount: sc.aheadCount || 0,
          currentCallingNumber: sc.currentCallingNumber || '--',
          remainingMinutes: sc.remainingMinutes || 0,
          isAlmostReady: !!sc.isAlmostReady
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] queue-progress-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] queue-progress-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] queue-progress-card overflow monitor=on')
    }
  },
  methods: {
    onTapRefresh() {
      if (!this.data.ticketId) return
      const args = { ticketId: this.data.ticketId }
      console.info(`[ai-mode] queue-progress-card send api/call name=getQueueProgress args=${JSON.stringify(args)}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '刷新进度' },
          { type: 'api/call', data: { name: 'getQueueProgress', arguments: args } }
        ]
      })
    }
  }
})
