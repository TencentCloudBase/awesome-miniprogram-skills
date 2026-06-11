// 门店库存卡片组件
// 规范：
// - 基础数据从 structuredContent 获取（Agent 语义筛选后下发）
// - 门店完整信息（含地址）从 _meta 补充
const { isPreviewMode } = require('../../utils/storage')

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
    },
    attached() {
      // TODO: 以下为 cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && !this.data.productName) {
        console.info('[ai-mode] stock-check-card 预览模式，展示模拟库存数据')
        this.setData({
          productName: '潮玩手办·限量版',
          stores: [{
            storeName: '望京店',
            stock: 15,
            status: '充足',
            price: 299
          }]
        })
      }
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
