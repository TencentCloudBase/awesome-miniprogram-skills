// 商品详情卡片组件
// 规范：
// - 基础数据从 structuredContent 获取（Agent 语义筛选后下发）
// - imageUrl 从 _meta 补充（Agent 不可见的纯渲染数据）
const { isPreviewMode } = require('../../utils/storage')

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
    },
    attached() {
      // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && !this.data.name) {
        console.info('[ai-mode] product-detail-card 预览模式，展示模拟商品详情')
        const MOCK_STORES = [
          { storeId: 1, storeName: '望京店', stock: 15, status: '充足', price: 299, address: '北京市朝阳区望京SOHO' },
          { storeId: 2, storeName: '三里屯店', stock: 8, status: '一般', price: 299, address: '北京市朝阳区三里屯太古里' },
          { storeId: 3, storeName: '西单店', stock: 3, status: '紧张', price: 309, address: '北京市西城区西单大悦城' }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          productId: 1,
          name: '潮玩手办·限量版',
          price: 299,
          description: '限量发售的潮流手办，做工精细，适合收藏',
          categoryName: '潮玩',
          imageUrl: '',
          tags: ['限量', '新品'],
          stores: MOCK_STORES.slice(0, maxItems)
        })
      }
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
