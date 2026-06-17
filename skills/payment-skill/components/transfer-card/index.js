// skills/payment-skill/components/transfer-card/index.js
// 转账卡片组件：展示商家转账结果和转账状态
Component({
  data: {
    outBillNo: '',
    transferBillNo: '',
    transferAmountYuan: '0.00',
    state: '',
    stateDesc: '',
    statusIcon: '',
    statusColor: '',
    remark: '',
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
          'ACCEPTED': { icon: '!', color: '#1565C0' },
          'PROCESSING': { icon: '!', color: '#F57C00' },
          'TRANSFERING': { icon: '!', color: '#F57C00' },
          'SUCCESS': { icon: '✓', color: '#2E7D32' },
          'FAIL': { icon: '✗', color: '#C62828' },
          'WAIT_USER_CONFIRM': { icon: '!', color: '#7B1FA2' },
          'CANCELLED': { icon: '✗', color: '#757575' },
          'CANCELING': { icon: '!', color: '#757575' }
        }
        const statusInfo = statusMap[sc.state] || { icon: '?', color: '#757575' }

        let createTimeText = ''
        if (sc.createTime || meta.createTime) {
          try {
            const t = new Date(sc.createTime || meta.createTime)
            const pad = (n) => String(n).padStart(2, '0')
            createTimeText = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
          } catch (e) { createTimeText = '' }
        }

        this.setData({
          outBillNo: sc.outBillNo || '',
          transferBillNo: sc.transferBillNo || '',
          transferAmountYuan: ((sc.transferAmount || 0) / 100).toFixed(2),
          state: sc.state || '',
          stateDesc: sc.stateDesc || '',
          statusIcon: statusInfo.icon,
          statusColor: statusInfo.color,
          remark: meta.remark || '',
          createTime: createTimeText
        })
      })
    }
  },
  methods: {
    onTapQueryTransfer() {
      if (!this.data.outBillNo) return
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查询转账状态' },
          { type: 'api/call', data: { name: 'queryTransfer', arguments: { outBillNo: this.data.outBillNo } } }
        ]
      })
    }
  }
})
