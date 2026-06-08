// 下单成功卡片组件
// 规范：
// - 基础数据从 structuredContent 获取
// - imageUrl 和门店地址从 _meta 补充
Component({
  data: {
    orderId: '',
    productName: '',
    totalPrice: 0,
    storeName: '',
    orderTime: '',
    status: '',
    imageUrl: '',
    address: ''
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
          orderId: sc.orderId || '',
          productName: sc.productName || '',
          totalPrice: sc.totalPrice || 0,
          storeName: sc.storeName || '',
          orderTime: sc.orderTime || '',
          status: sc.status || '',
          imageUrl: meta.imageUrl || '',
          address: meta.address || ''
        })
      })
    }
  },
  methods: {
    onTapBack() {
      // 返回首页浏览更多
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '再看看其他潮玩' },
          { type: 'api/call', data: { name: 'searchProducts', arguments: { keyword: '' } } }
        ]
      })
    }
  }
})
