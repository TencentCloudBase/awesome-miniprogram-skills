// skills/bill-skill/components/bill-list-card/index.js
const { isPreviewMode } = require('../../utils/util')

Component({
  data: {
    items: [],
    total: 0,
    totalAmount: '0.00',
    overdueCount: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] bill-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] bill-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          total: sc.total || 0,
          totalAmount: String(sc.totalAmount || '0.00'),
          overdueCount: sc.overdueCount || 0
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] bill-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] bill-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] bill-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] bill-list-card overflow monitor=on')
    },
    attached() {
      // TODO: 以下为 cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
      // 待 CLI 工具修复后会删掉这段，生产路径不受影响。
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] bill-list-card 预览模式，展示模拟账单列表')
        this.setData({
          items: [{
            billId: 'bill_001',
            title: '电费',
            amount: 156.80,
            dueDate: '2026-06-20',
            status: 'unpaid',
            category: 'utility'
          }],
          total: 1
        })
      }
    }
  },
  methods: {
    onTapPay(e) {
      const { billId, billTypeText, amount } = e.currentTarget.dataset
      console.info(`[ai-mode] bill-list-card send api/call name=payBill args=${JSON.stringify({ billId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `缴纳${billTypeText} ¥${amount}` },
          { type: 'api/call', data: { name: 'payBill', arguments: { billId } } }
        ]
      })
    }
  }
})
