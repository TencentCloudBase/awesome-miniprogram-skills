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
    // TODO: cli agent render 截图时序问题的临时兼容，待 CLI 修复后清理
    attached() {
      if (isPreviewMode() && this.data.items.length === 0) {
        const MOCK_DATA = [
          { paymentId: 'pay_001', billTitle: '电费', amount: 156.80, payTime: '2026-05-20 10:30', status: 'success', method: '微信支付' },
          { paymentId: 'pay_002', billTitle: '水费', amount: 45.50, payTime: '2026-05-18 14:20', status: 'success', method: '银行卡支付' },
          { paymentId: 'pay_003', billTitle: '燃气费', amount: 89.20, payTime: '2026-05-15 09:00', status: 'success', method: '微信支付' }
        ]
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { /* 非 CLI 截图环境忽略 */ }
        console.info('[ai-mode] history-card 预览模式, maxItems=', maxItems)
        this.setData({
          items: MOCK_DATA.slice(0, maxItems),
          total: maxItems
        })
      }
    }
  },
  methods: {}
})
