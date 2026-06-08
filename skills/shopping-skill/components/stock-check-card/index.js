// 门店库存卡片组件
// 规范：
// - 基础数据从 structuredContent 获取（Agent 语义筛选后下发）
// - 门店完整信息（含地址）从 _meta 补充
Component({
  data: {
    productName: '',
    productId: 0,
    stores: [],
    imageUrl: ''
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
        // _meta.stores 含完整门店信息（含地址），sc.stores 为精简版
        const viewStores = meta.stores || sc.stores || []
        this.setData({
          productName: sc.productName || '',
          productId: sc.productId,
          stores: viewStores,
          imageUrl: meta.imageUrl || ''
        })
      })
    }
  },
  methods: {
    onTapOrder(e) {
      const store = e.currentTarget.dataset.store
      if (!store || store.stock <= 0) return
      if (!this.data.productId) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `在${store.storeName}购买` },
          { type: 'api/call', data: { name: 'placeOrder', arguments: { productId: this.data.productId, storeId: store.storeId } } }
        ]
      })
    }
  }
})
