/**
 * record-card 记账结果卡片
 * 展示单条记账/删除记录的结果
 */
Component({
  data: {
    action: '', // add / delete
    type: '',
    category: '',
    note: '',
    date: '',
    time: '',
    todayTotal: 0,
    budgetInfo: null,
    deletedRecord: null,
    loaded: false
  },

  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const amount = sc.amount || 0
        const todayTotal = sc.todayTotal || 0
        const budgetInfo = sc.budgetInfo || null
        const deletedRecord = sc.deletedRecord || null

        this.setData({
          action: sc.action || 'add',
          type: sc.type || '',
          category: sc.category || '',
          amountDisplay: (amount / 100).toFixed(2),
          note: sc.note || '',
          date: sc.date || '',
          time: sc.time || '',
          todayTotal: todayTotal,
          todayTotalDisplay: (todayTotal / 100).toFixed(2),
          budgetInfo: budgetInfo,
          budgetRemainingDisplay: budgetInfo ? (Math.abs(budgetInfo.remaining) / 100).toFixed(2) : '',
          deletedRecord: deletedRecord,
          deletedAmountDisplay: deletedRecord ? (deletedRecord.amount / 100).toFixed(2) : '',
          loaded: true
        })
      })
    }
  },

  methods: {
    /**
     * 金额分转元
     */
    formatAmount(fen) {
      return (fen / 100).toFixed(2)
    },

    /**
     * 查看今日账单
     */
    onTapViewToday() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看今天的账单' }
        ]
      })
    },

    /**
     * 查看统计
     */
    onTapViewStats() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看本月消费统计' }
        ]
      })
    }
  }
})
