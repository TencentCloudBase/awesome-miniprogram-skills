Component({
  data: {
    storeId: '',
    storeName: '',
    address: '',
    businessHours: '',
    queueEnabled: false,
    queueStatusText: '',
    currentCallingNumber: '--',
    waitingCount: 0,
    estimatedMinutes: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] store-queue-status-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] store-queue-status-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          storeId: sc.storeId || '',
          storeName: sc.storeName || '',
          address: sc.address || '',
          businessHours: sc.businessHours || '',
          queueEnabled: !!sc.queueEnabled,
          queueStatusText: sc.queueStatusText || '',
          currentCallingNumber: sc.currentCallingNumber || '--',
          waitingCount: sc.waitingCount || 0,
          estimatedMinutes: sc.estimatedMinutes || 0
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] store-queue-status-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] store-queue-status-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] store-queue-status-card overflow monitor=on')
    }
  },
  methods: {
    onTapTakeNumber() {
      if (!this.data.queueEnabled || !this.data.storeId) return
      const args = { storeId: this.data.storeId }
      console.info(`[ai-mode] store-queue-status-card send api/call name=takeQueueNumber args=${JSON.stringify(args)}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '立即取号' },
          { type: 'api/call', data: { name: 'takeQueueNumber', arguments: args } }
        ]
      })
    },
    onTapRefresh() {
      if (!this.data.storeId) return
      const args = { storeId: this.data.storeId }
      console.info(`[ai-mode] store-queue-status-card send api/call name=getStoreQueueStatus args=${JSON.stringify(args)}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '刷新排队' },
          { type: 'api/call', data: { name: 'getStoreQueueStatus', arguments: args } }
        ]
      })
    }
  }
})
