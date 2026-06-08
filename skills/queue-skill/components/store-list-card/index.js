Component({
  data: {
    items: [],
    keyword: ''
  },
  lifetimes: {
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
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] store-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
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
