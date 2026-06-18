/**
 * statistics-card 统计报表卡片
 * 展示分类统计和消费趋势
 */
Component({
  data: {
    groups: [],
    budget: null,
    startDate: '',
    endDate: '',
    type: 'expense',
    loaded: false
  },

  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const total = sc.total || 0
        const groups = (sc.groups || []).map(item => ({
          ...item,
          amountDisplay: (item.amount / 100).toFixed(2)
        }))
        const budget = sc.budget || null
        let budgetData = null
        if (budget) {
          budgetData = {
            ...budget,
            usedDisplay: (budget.used / 100).toFixed(2),
            totalDisplay: (budget.total / 100).toFixed(2),
            remainingDisplay: (Math.abs(budget.remaining) / 100).toFixed(2)
          }
        }

        this.setData({
          totalDisplay: (total / 100).toFixed(2),
          groups: groups,
          budget: budgetData,
          startDate: sc.startDate || '',
          endDate: sc.endDate || '',
          type: sc.type || 'expense',
          loaded: true
        })
      })
    }
  },

  methods: {
    formatAmount(fen) {
      return (fen / 100).toFixed(2)
    },

    /**
     * 获取进度条宽度
     */
    getBarWidth(percent) {
      return Math.max(percent, 2) + '%'
    },

    /**
     * 点击分类查看详情
     */
    onTapCategory(e) {
      const { name } = e.currentTarget.dataset
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${name}的消费明细` }
        ]
      })
    },

    /**
     * 设置预算
     */
    onTapSetBudget() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '我想设置本月预算' }
        ]
      })
    }
  }
})
