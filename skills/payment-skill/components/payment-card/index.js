// skills/payment-skill/components/payment-card/index.js
// 支付订单卡片组件
Component({
  data: {
    outTradeNo: '',
    description: '',
    totalFeeYuan: '0.00',
    status: '',
    statusText: '',
    payTimeText: '',
    statusIcon: '',
    statusColor: ''
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = (data && data.result) || {}
        const sc = result.structuredContent || {}

        const statusMap = {
          'SUCCESS': { text: '支付成功', icon: '✓', color: '#2E7D32' },
          'FAIL': { text: '支付失败', icon: '✗', color: '#C62828' },
          'CANCEL': { text: '已取消', icon: '!', color: '#F57C00' },
          'NOTPAY': { text: '待支付', icon: '!', color: '#1565C0' }
        }
        const statusInfo = statusMap[sc.status] || statusMap['NOTPAY']

        let payTimeText = ''
        if (sc.payTime) {
          try {
            const t = new Date(sc.payTime)
            const pad = (n) => String(n).padStart(2, '0')
            payTimeText = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
          } catch (e) { payTimeText = '' }
        }

        this.setData({
          outTradeNo: sc.outTradeNo || '',
          description: sc.description || '',
          totalFeeYuan: ((sc.totalFee || 0) / 100).toFixed(2),
          status: sc.status || 'NOTPAY',
          statusText: statusInfo.text,
          statusIcon: statusInfo.icon,
          statusColor: statusInfo.color,
          payTimeText
        })
      })
    }
  },
  methods: {
    onTapQueryOrder() {
      if (!this.data.outTradeNo) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查询订单状态' },
          { type: 'api/call', data: { name: 'queryOrder', arguments: { outTradeNo: this.data.outTradeNo } } }
        ]
      })
    }
  }
})
