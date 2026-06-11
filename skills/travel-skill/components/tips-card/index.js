const { isPreviewMode } = require('../../utils/util')

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
        this.setData({
          items: [
            { id: 'T01', category: '行前准备', icon: '🎒', title: '提前预订省更多', content: '建议提前2-4周预订机票和酒店，可节省20%-30%的费用。' },
            { id: 'T02', category: '交通出行', icon: '🚗', title: '租车 vs 打车', content: '家庭出行推荐租车；2人以内打车或网约车更划算。' }
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
