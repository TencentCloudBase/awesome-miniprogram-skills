// skills/payment-skill/components/order-status-card/index.js
// 订单状态卡片组件：展示订单当前状态，提供操作入口（关闭订单、发起退款）
Component({
  data: {
    outTradeNo: '',
    transactionId: '',
    tradeState: '',
    tradeStateDesc: '',
    totalFee: 0,
    totalFeeYuan: '0.00',
    description: '',
    closeTime: '',
    statusIcon: '',
    statusColor: '',
    canClose: false,
    canRefund: false
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = (data && data.result) || {}
        const sc = result.structuredContent || {}

        const statusMap = {
          'SUCCESS': { icon: '✓', color: '#2E7D32' },
          'NOTPAY': { icon: '!', color: '#F57C00' },
          'CLOSED': { icon: '✗', color: '#757575' },
          'REFUND': { icon: '↩', color: '#1565C0' },
          'USERPAYING': { icon: '!', color: '#F57C00' },
          'PAYERROR': { icon: '!', color: '#C62828' },
          'REVOKED': { icon: '✗', color: '#757575' }
        }
        const statusInfo = statusMap[sc.tradeState] || { icon: '?', color: '#757575' }

        let closeTimeText = ''
        if (sc.closeTime) {
          try {
            const t = new Date(sc.closeTime)
            const pad = (n) => String(n).padStart(2, '0')
            closeTimeText = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
          } catch (e) { closeTimeText = '' }
        }

        this.setData({
          outTradeNo: sc.outTradeNo || '',
          transactionId: sc.transactionId || '',
          tradeState: sc.tradeState || '',
          tradeStateDesc: sc.tradeStateDesc || '',
          totalFee: sc.totalFee || 0,
          totalFeeYuan: ((sc.totalFee || 0) / 100).toFixed(2),
          description: sc.description || '',
          closeTime: closeTimeText,
          statusIcon: statusInfo.icon,
          statusColor: statusInfo.color,
          canClose: sc.tradeState === 'NOTPAY',
          canRefund: sc.tradeState === 'SUCCESS'
        })
      })
    }
  },
  methods: {
    onTapClose() {
      if (!this.data.outTradeNo || !this.data.canClose) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '关闭此订单' },
          { type: 'api/call', data: { name: 'closeOrder', arguments: { outTradeNo: this.data.outTradeNo } } }
        ]
      })
    },
    onTapRefund() {
      if (!this.data.outTradeNo || !this.data.canRefund) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '申请退款' },
          { type: 'api/call', data: { name: 'refundOrder', arguments: { outTradeNo: this.data.outTradeNo, refundFee: this.data.totalFee } } }
        ]
      })
    }
  }
})
