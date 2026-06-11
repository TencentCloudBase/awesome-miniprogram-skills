const { isPreviewMode } = require('../../utils/util')

// skills/travel-skill/components/tips-card/index.js
Component({
  data: {
    items: [],
    expandedId: ''
  },
  lifetimes: {
    // TODO: 预览模式兜底，待 CLI 修复截图时序后清理
    attached() {
      if (isPreviewMode()) {
        this.setData({
          items: [
            { tipId: 1, title: '最佳旅行时间', content: '春秋两季气候宜人', category: '出行建议' },
            { tipId: 2, title: '当地美食', content: '特色小吃不容错过', category: '美食' }
          ]
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
