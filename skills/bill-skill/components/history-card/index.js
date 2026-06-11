// skills/bill-skill/components/history-card/index.js
const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    items: [],
    total: 0,
    totalAmount: '0.00'
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] history-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] history-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          total: sc.total || 0,
          totalAmount: String(sc.totalAmount || '0.00')
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] history-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] history-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] history-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] history-card overflow monitor=on')
    },
    attached() {
      // TODO: 以下为 cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] history-card 预览模式，展示模拟缴费记录')
        this.setData({
          items: [{
            paymentId: 'pay_001',
            billTitle: '电费',
            amount: 156.80,
            payTime: '2026-05-20 10:30',
            status: 'success',
            method: '微信支付'
          }],
          total: 1
        })
      }
    }
  },
  methods: {}
})
