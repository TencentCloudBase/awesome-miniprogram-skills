// 商品详情卡片组件
// 规范：
// - 基础数据从 structuredContent 获取（Agent 语义筛选后下发）
// - imageUrl 从 _meta 补充（Agent 不可见的纯渲染数据）
Component({
  data: {
    productId: 0,
    name: '',
    price: 0,
    description: '',
    categoryName: '',
    imageUrl: '',
    tags: [],
    stores: []
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
        this.setData({
          productId: sc.productId,
          name: sc.name || '',
          price: sc.price || 0,
          description: sc.description || '',
          categoryName: sc.categoryName || '',
          imageUrl: meta.imageUrl || '',
          tags: meta.tags || [],
          stores: sc.stores || []
        })
      })
    }
  },
  methods: {
    onTapBuy() {
      if (!this.data.productId || !this.data.stores.length) return
      const storeId = this.data.stores[0].storeId
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `下单购买${this.data.name}` },
          { type: 'api/call', data: { name: 'placeOrder', arguments: { productId: this.data.productId, storeId } } }
        ]
      })
    },
    onTapCheckStock() {
      if (!this.data.productId) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${this.data.name}的门店库存` },
          { type: 'api/call', data: { name: 'checkStoreStock', arguments: { productId: this.data.productId } } }
        ]
      })
    }
  }
})
