const { isPreviewMode } = require('../../utils/util')

const MOCK_DATA = [
  { tipId: 1, title: '最佳旅行时间', content: '春秋两季气候宜人', category: '出行建议' },
  { tipId: 2, title: '当地美食', content: '特色小吃不容错过', category: '美食' },
  { tipId: 3, title: '交通指南', content: '地铁公交覆盖主要景点', category: '交通' }
]

// skills/travel-skill/components/tips-card/index.js
Component({
  data: {
    items: [],
    expandedId: ''
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容，待 CLI 修复后清理
    attached() {
      if (isPreviewMode() && this.data.items.length === 0) {
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          items: MOCK_DATA.slice(0, maxItems)
        })
      }
    },
    created() {
      console.info('[ai-mode] tips-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] tips-card 收到 Result:', JSON.stringify(sc))
        this.setData({ items: sc.items || [] })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] tips-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] tips-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] tips-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] tips-card overflow monitor=on')
    }
  },
  methods: {
    onToggle(e) {
      const { id } = e.currentTarget.dataset
      this.setData({
        expandedId: this.data.expandedId === id ? '' : id
      })
    },
    onTapSearch(e) {
      console.info('[ai-mode] tips-card send api/call name=searchDestinations')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '开始规划旅行' },
          { type: 'api/call', data: { name: 'searchDestinations', arguments: { keyword: '' } } }
        ]
      })
    }
  }
})
