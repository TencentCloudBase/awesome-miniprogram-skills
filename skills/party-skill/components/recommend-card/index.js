Component({
  data: {
    items: [],
    total: 0,
    type: '',
    keyword: '',
    activeFilter: '',
    filterOptions: [
      { value: '', label: '全部' },
      { value: 'restaurant', label: '餐厅' },
      { value: 'party_house', label: '轰趴馆' },
      { value: 'ktv', label: 'KTV' },
      { value: 'outdoor', label: '户外' }
    ]
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] recommend-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] recommend-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          total: sc.total || 0,
          type: sc.type || '',
          keyword: sc.keyword || '',
          activeFilter: sc.type || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] recommend-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] recommend-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] recommend-card overflow monitor=on')
    }
  },
  methods: {
    onFilterChange(e) {
      const type = e.currentTarget.dataset.value
      this.setData({ activeFilter: type })
      console.info(`[ai-mode] recommend-card send api/call name=getRecommendations args=${JSON.stringify({ type })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: type ? `查看${type}类推荐` : '查看全部推荐' },
          { type: 'api/call', data: { name: 'getRecommendations', arguments: { type } } }
        ]
      })
    },
    onSelect(e) {
      const { id, name } = e.currentTarget.dataset
      console.info(`[ai-mode] recommend-card select item id=${id} name=${name}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择${name}` }
        ]
      })
    }
  }
})
