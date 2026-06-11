// 潮玩商品列表组件
// 规范：
// - 组件渲染基于 structuredContent（Agent 语义筛选后下发）
// - imageUrl 等纯渲染字段从 _meta 补充（Agent 不可见，不参与语义筛选）
const { isPreviewMode } = require('../../utils/storage')

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
    },
    attached() {
      // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] product-list-card 预览模式，展示模拟商品列表')
        const MOCK_ITEMS = [
          { productId: 1, name: '潮玩手办·限量版', price: 299, originalPrice: 399, imageUrl: '', tags: ['限量', '新品'] },
          { productId: 2, name: '机械键盘·青轴', price: 599, originalPrice: 799, imageUrl: '', tags: ['热销'] },
          { productId: 3, name: '无线降噪耳机', price: 899, originalPrice: 1099, imageUrl: '', tags: ['新品', '旗舰'] }
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
          keyword: ''
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
          { type: 'text', text: `查看${item.name}详情` },
          { type: 'api/call', data: { name: 'getProductDetail', arguments: { productId: item.productId } } }
        ]
      })
    }
  }
})
