/**
 * reminder-card 提醒设置卡片
 * 展示订阅消息提醒的设置结果
 */
Component({
  data: {
    title: '',
    category: '',
    startDisplay: '',
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
        // 保存仅 JS 内部使用的字段为实例属性
        this._eventId = sc.eventId || ''
        this._remindBefore = sc.remindBefore || 15

        this.setData({
          title: sc.title || '',
          category: sc.category || '',
          startDisplay: sc.startDisplay || '',
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
      const eventId = this._eventId
      const remindBefore = this._remindBefore
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
