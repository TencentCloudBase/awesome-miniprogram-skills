/**
 * reminder-card 提醒设置卡片
 * 展示订阅消息提醒的设置结果
 */
Component({
  data: {
    action: '',
    eventId: '',
    title: '',
    category: '',
    startTime: '',
    startDisplay: '',
    remindBefore: 15,
    remindText: '',
    subscribed: false,
    subscribeStatus: '', // accepted / rejected / no_template
    loaded: false
  },

  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        this.setData({
          action: sc.action || 'subscribe',
          eventId: sc.eventId || '',
          title: sc.title || '',
          category: sc.category || '',
          startTime: sc.startTime || '',
          startDisplay: sc.startDisplay || '',
          remindBefore: sc.remindBefore || 15,
          remindText: sc.remindText || '',
          subscribed: sc.subscribed || false,
          subscribeStatus: sc.subscribeStatus || '',
          loaded: true
        })
      })
    }
  },

  methods: {
    /**
     * 重新尝试订阅
     */
    onTapRetrySubscribe() {
      const { eventId, remindBefore } = this.data
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '重新设置日程提醒' },
          { type: 'api/call', data: { name: 'subscribeReminder', arguments: { eventId, remindBefore } } }
        ]
      })
    },

    /**
     * 查看日程
     */
    onTapViewEvents() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看我的日程安排' }
        ]
      })
    }
  }
})
