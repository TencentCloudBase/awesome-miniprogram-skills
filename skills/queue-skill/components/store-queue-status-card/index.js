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
    // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
    // 待 CLI 修复后清理此段。
    attached() {
      const { isPreviewMode } = require('../../utils/util')
      if (isPreviewMode() && !this.data.storeId) {
        console.info('[ai-mode] store-queue-status-card 预览模式，使用 mock 数据')
        this.setData({
          storeId: 'store_001',
          storeName: '望京SOHO店',
          address: '北京市朝阳区望京SOHO T1',
          queueEnabled: true,
          queueStatusText: '营业中',
          currentCallingNumber: 'A038',
          waitingCount: 8,
          estimatedMinutes: 18
        })
      }
    },
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
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] store-queue-status-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] store-queue-status-card getDimensions skipped:', e.message)
      }
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
