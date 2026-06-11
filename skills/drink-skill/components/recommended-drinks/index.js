// 推荐饮品列表组件
// 规范：
// - 组件渲染基于 structuredContent（Agent 语义筛选后下发）
// - imageUrl 等纯渲染字段从 _meta 补充（Agent 不可见，不参与语义筛选）
const { isPreviewMode } = require('../../utils/storage')

Component({
  data: {
    title: '为你推荐',
    items: [],
    total: 0,
    hasMore: false
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._viewCtx = wx.modelContext.getViewContext(this)
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = data && data.result ? data.result : {}
        const sc = result.structuredContent || {}
        const meta = result._meta || {}
        // 优先使用 _meta.viewItems（含 imageUrl），fallback 到 structuredContent.items
        const viewItems = meta.viewItems || sc.items || []
        this.setData({
          items: viewItems.slice(0, 3),
          total: sc.total || viewItems.length,
          hasMore: sc.hasMore || (sc.total && sc.total > 3),
          title: sc.keyword ? `"${sc.keyword}" 搜索结果` : '为你推荐'
        })
        if (sc.keyword) {
          this._viewCtx.setRelatedPage({ query: `keyword=${encodeURIComponent(sc.keyword)}` })
        }
      })
    },
    attached() {
      // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] recommended-drinks 预览模式，展示模拟饮品列表')
        const MOCK_ITEMS = [
          { drinkId: 'd_001', name: '生椰拿铁', price: 32, imageUrl: '', tags: ['热销'] },
          { drinkId: 'd_002', name: '杨枝甘露', price: 28, imageUrl: '', tags: ['新品'] },
          { drinkId: 'd_003', name: '茉莉奶绿', price: 22, imageUrl: '', tags: ['经典'] }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          items: MOCK_ITEMS.slice(0, maxItems),
          total: 3,
          hasMore: maxItems < 3,
          title: '为你推荐'
        })
      }
    }
  },
  methods: {
    onTapItem(e) {
      const item = e.currentTarget.dataset.item
      if (!item) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择${item.name}` },
          { type: 'api/call', data: { name: 'selectDrink', arguments: { drinkId: item.drinkId } } }
        ]
      })
    },
    onTapMore() {
      this._viewCtx.openDetailPage({
        url: '/packageDetail/pages/more-drinks'
      })
    }
  }
})
