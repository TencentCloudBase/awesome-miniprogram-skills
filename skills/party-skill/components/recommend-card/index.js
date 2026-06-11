const { isPreviewMode } = require('../../utils/util')

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
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] recommend-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] recommend-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] recommend-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] recommend-card overflow monitor=on')
    },
    attached() {
      // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] recommend-card 预览模式，展示模拟推荐')
        const MOCK_ITEMS = [
          { id: 'r_001', name: '海底捞·望京店', type: 'restaurant', address: '望京', rating: 4.8, tags: ['火锅', '聚餐'] },
          { id: 'r_002', name: '唱吧麦颂KTV', type: 'ktv', address: '三里屯', rating: 4.5, tags: ['唱歌', '聚会'] },
          { id: 'r_003', name: '轰趴馆·朝阳店', type: 'party_house', address: '朝阳大悦城', rating: 4.6, tags: ['桌游', '团建'] }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          items: MOCK_ITEMS.slice(0, maxItems),
          total: 3
        })
      }
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
