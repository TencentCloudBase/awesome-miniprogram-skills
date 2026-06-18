// skills/payment-skill/components/refund-card/index.js
// 退款卡片组件：展示退款结果和退款状态
Component({
  data: {
    outRefundNo: '',
    outTradeNo: '',
    refundFeeYuan: '0.00',
    refundStatus: '',
    refundStatusDesc: '',
    statusIcon: '',
    statusColor: '',
    reason: '',
    createTime: ''
  },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      const { NotificationType } = wx.modelContext
      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = (data && data.result) || {}
        const sc = result.structuredContent || {}
        const meta = result._meta || {}

        const statusMap = {
          'SUCCESS': { icon: '✓', color: '#2E7D32' },
          'PROCESSING': { icon: '!', color: '#F57C00' },
          'ABNORMAL': { icon: '!', color: '#C62828' },
          'CLOSED': { icon: '✗', color: '#757575' }
        }
        const statusInfo = statusMap[sc.refundStatus] || { icon: '⏳', color: '#F57C00' }

        let createTimeText = ''
        if (sc.createTime || meta.createTime) {
          try {
            const t = new Date(sc.createTime || meta.createTime)
            const pad = (n) => String(n).padStart(2, '0')
            createTimeText = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
          } catch (e) { createTimeText = '' }
        }

        this.setData({
          outRefundNo: sc.outRefundNo || '',
          outTradeNo: sc.outTradeNo || '',
          refundFeeYuan: ((sc.refundFee || 0) / 100).toFixed(2),
          refundStatus: sc.refundStatus || '',
          refundStatusDesc: sc.refundStatusDesc || '',
          statusIcon: statusInfo.icon,
          statusColor: statusInfo.color,
          reason: meta.reason || '',
          createTime: createTimeText
        })
      })
    }
  },
  methods: {
    onTapQueryRefund() {
      if (!this.data.outRefundNo) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查询退款进度' },
          { type: 'api/call', data: { name: 'queryRefund', arguments: { outRefundNo: this.data.outRefundNo } } }
        ]
      })
    }
  }
})
