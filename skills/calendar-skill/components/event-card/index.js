/**
 * event-card 日程结果卡片
 * 展示创建/修改/删除日程的结果
 */
Component({
  data: {
    action: '',  // add / update / delete
    title: '',
    category: '',
    location: '',
    startDisplay: '',
    endDisplay: '',
    allDay: false,
    remindText: '',
    subscribed: false,
    deletedEvent: null,
    loaded: false
  },

  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        // 保存仅 JS 内部使用的字段为实例属性
        this._eventId = sc.eventId || ''

        this.setData({
          action: sc.action || 'add',
          title: sc.title || '',
          category: sc.category || '',
          location: sc.location || '',
          startDisplay: sc.startDisplay || '',
          endDisplay: sc.endDisplay || '',
          allDay: sc.allDay || false,
          remindText: sc.remindText || '',
          subscribed: sc.subscribed || false,
          deletedEvent: sc.deletedEvent || null,
          loaded: true
        })
      })
    }
  },

  methods: {
    /**
     * 查看日程列表
     */
    onTapViewEvents() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看我的日程安排' }
        ]
      })
    },

    /**
     * 设置提醒
     */
    onTapSubscribe() {
      const eventId = this._eventId
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '为这个日程设置提醒' },
          { type: 'api/call', data: { name: 'subscribeReminder', arguments: { eventId } } }
        ]
      })
    },

    /**
     * 修改日程
     */
    onTapEdit() {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '我想修改这个日程' }
        ]
      })
    }
  }
})
