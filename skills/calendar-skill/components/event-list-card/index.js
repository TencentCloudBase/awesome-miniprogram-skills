/**
 * event-list-card 日程列表卡片
 * 展示多条日程记录
 */
Component({
  data: {
    events: [],
    total: 0,
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
        this.setData({
          events: sc.events || [],
          total: sc.total || 0,
          startDate: sc.startDate || '',
          endDate: sc.endDate || '',
          hasMore: sc.hasMore || false,
          loaded: true
        })
      })
    }
  },

  methods: {
    /**
     * 点击日程查看详情/设置提醒
     */
    onTapEvent(e) {
      const { id, title } = e.currentTarget.dataset
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看「${title}」的详情` }
        ]
      })
    },

    /**
     * 删除日程
     */
    onTapDelete(e) {
      const { id } = e.currentTarget.dataset
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '删除这个日程' },
          { type: 'api/call', data: { name: 'deleteEvent', arguments: { eventId: id } } }
        ]
      })
    },

    /**
     * 创建新日程
     */
    onTapCreate() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '我想创建一个新日程' }
        ]
      })
    },

    /**
     * 加载更多
     */
    onTapMore() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看更多日程' }
        ]
      })
    }
  }
})
