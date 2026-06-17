/**
 * budget-card 预算设置卡片
 * 展示预算设置结果和使用情况
 */
Component({
  data: {
    budgetId: '',
    category: '',
    amount: 0,
    month: '',
    used: 0,
    remaining: 0,
    loaded: false
  },

  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const amount = sc.amount || 0
        const used = sc.used || 0
        const remaining = sc.remaining || 0
        const usedPercent = amount > 0 ? Math.min((used / amount) * 100, 100) : 0

        this.setData({
          budgetId: sc.budgetId || '',
          category: sc.category || '',
          amount: amount,
          amountDisplay: (amount / 100).toFixed(2),
          month: sc.month || '',
          used: used,
          usedDisplay: (used / 100).toFixed(2),
          remaining: remaining,
          remainingDisplay: (Math.abs(remaining) / 100).toFixed(2),
          usedPercent: usedPercent,
          loaded: true
        })
      })
    }
  },

  methods: {
    formatAmount(fen) {
      return (fen / 100).toFixed(2)
    },

    getUsedPercent() {
      if (this.data.amount <= 0) return 0
      const percent = (this.data.used / this.data.amount) * 100
      return Math.min(percent, 100)
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
    },

    /**
     * 修改预算
     */
    onTapEditBudget() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `修改${this.data.category === 'total' ? '总' : this.data.category}预算` }
        ]
      })
    }
  }
})
