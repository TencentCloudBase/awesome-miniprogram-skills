const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    items: [],
    keyword: ''
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容，待 CLI 修复后清理
    attached() {
      if (isPreviewMode() && this.data.items.length === 0) {
        const MOCK_DATA = [
          { storeId: 'store_001', storeName: '望京SOHO店', distance: '1.2km', waitingCount: 5, estimatedMinutes: 15, queueEnabled: true },
          { storeId: 'store_002', storeName: '国贸店', distance: '3.5km', waitingCount: 12, estimatedMinutes: 30, queueEnabled: true },
          { storeId: 'store_003', storeName: '三里屯店', distance: '5.0km', waitingCount: 3, estimatedMinutes: 10, queueEnabled: true }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { /* 非 CLI 截图环境忽略 */ }
        console.info('[ai-mode] store-list-card 预览模式, maxItems=', maxItems)
        this.setData({
          items: MOCK_DATA.slice(0, maxItems),
          keyword: ''
        })
      }
    },
    created() {
      console.info('[ai-mode] store-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] store-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          keyword: sc.keyword || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] store-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] store-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] store-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] store-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapStatus(e) {
      const { storeId, storeName } = e.currentTarget.dataset
      console.info(`[ai-mode] store-list-card send api/call name=getStoreQueueStatus args=${JSON.stringify({ storeId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${storeName}` },
          { type: 'api/call', data: { name: 'getStoreQueueStatus', arguments: { storeId } } }
        ]
      })
    }
  }
})
