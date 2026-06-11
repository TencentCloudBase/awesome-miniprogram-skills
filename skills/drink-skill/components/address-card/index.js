Component({
  data: {
    hasAddress: false,
    address: null,
    pendingOrderId: ''
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
          hasAddress: !!sc.hasAddress,
          address: sc.address || null,
          pendingOrderId: meta.pendingOrderId || ''
        })
      })
    },
    attached() {
      // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 修复后清理此段。
      try {
        const { isPreviewMode } = require('../../utils/storage')
        if (isPreviewMode() && !this.data.address) {
          console.info('[address-card] 预览模式，使用默认地址')
          this.setData({
            hasAddress: true,
            address: {
              name: '小明',
              phone: '13800138000',
              detail: '北京市朝阳区望京SOHO T1'
            }
          })
        }
      } catch (e) {
        // ignore
      }
    }
  },
  methods: {
    onTapEdit() {
      this._viewCtx.openDetailPage({
        url: '/packageDetail/pages/address-edit'
      })
    },
    onTapUse() {
      if (this.data.pendingOrderId) {
        this._modelCtx.sendFollowUpMessage({
          content: [
            { type: 'text', text: '使用该地址继续下单' },
            { type: 'api/call', data: { name: 'confirmOrder', arguments: { orderId: this.data.pendingOrderId } } }
          ]
        })
      }
    }
  }
})
