/**
 * event-card 日程结果卡片
 * 展示创建/修改/删除日程的结果
 */
Component({
  data: {
    action: '',  // add / update / delete
    eventId: '',
    title: '',
    category: '',
    location: '',
    startTime: '',
    endTime: '',
    startDisplay: '',
    endDisplay: '',
    allDay: false,
    remindBefore: 15,
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
        this.setData({
          action: sc.action || 'add',
          eventId: sc.eventId || '',
          title: sc.title || '',
          category: sc.category || '',
          location: sc.location || '',
          startTime: sc.startTime || '',
          endTime: sc.endTime || '',
          startDisplay: sc.startDisplay || '',
          endDisplay: sc.endDisplay || '',
          allDay: sc.allDay || false,
          remindBefore: sc.remindBefore || 15,
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
      const { eventId } = this.data
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
