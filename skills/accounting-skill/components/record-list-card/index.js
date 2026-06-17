/**
 * record-list-card 账单列表卡片
 * 展示多条记账记录
 */
Component({
  data: {
    records: [],
    totalExpense: 0,
    totalIncome: 0,
    count: 0,
    startDate: '',
    endDate: '',
    hasMore: false,
    loaded: false
  },

  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const records = (sc.records || []).map(item => ({
          ...item,
          amountDisplay: (item.amount / 100).toFixed(2)
        }))
        const totalExpense = sc.totalExpense || 0
        const totalIncome = sc.totalIncome || 0

        this.setData({
          records: records,
          totalExpense: totalExpense,
          totalExpenseDisplay: (totalExpense / 100).toFixed(2),
          totalIncome: totalIncome,
          totalIncomeDisplay: (totalIncome / 100).toFixed(2),
          count: sc.count || 0,
          startDate: sc.startDate || '',
          endDate: sc.endDate || '',
          hasMore: sc.hasMore || false,
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
     * 删除记录
     */
    onTapDelete(e) {
      const { id } = e.currentTarget.dataset
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `删除这条记录` },
          { type: 'api/call', data: { name: 'deleteRecord', arguments: { recordId: id } } }
        ]
      })
    },

    /**
     * 查看统计
     */
    onTapStats() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看消费统计' }
        ]
      })
    },

    /**
     * 加载更多
     */
    onTapMore() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看更多账单记录' }
        ]
      })
    }
  }
})
