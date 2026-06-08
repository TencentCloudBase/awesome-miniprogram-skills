// 潮玩商品列表组件
// 规范：
// - 组件渲染基于 structuredContent（Agent 语义筛选后下发）
// - imageUrl 等纯渲染字段从 _meta 补充（Agent 不可见，不参与语义筛选）
Component({
  data: {
    title: '精选推荐',
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
        const viewItems = meta.viewItems || sc.items || []
        this.setData({
          items: viewItems.slice(0, 3),
          total: sc.total || viewItems.length,
          hasMore: sc.hasMore || (sc.total && sc.total > 3),
          title: meta.title || (sc.keyword ? `"${sc.keyword}" 搜索结果` : '精选推荐')
        })
      })
    }
  },
  methods: {
    onTapItem(e) {
      const item = e.currentTarget.dataset.item
      if (!item) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${item.name}详情` },
          { type: 'api/call', data: { name: 'getProductDetail', arguments: { productId: item.productId } } }
        ]
      })
    }
  }
})
