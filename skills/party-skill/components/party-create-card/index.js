Component({
  data: {
    partyId: '',
    theme: '',
    date: '',
    time: '',
    location: '',
    guestCount: 0,
    status: '',
    createTime: '',
    inviteCode: '',
    isCreated: false
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] party-create-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] party-create-card 收到 Result:', JSON.stringify(sc))
        if (sc.partyId) {
          this.setData({
            partyId: sc.partyId,
            theme: sc.theme || '',
            date: sc.date || '',
            time: sc.time || '',
            location: sc.location || '',
            guestCount: sc.guestCount || 0,
            status: sc.status || '',
            createTime: sc.createTime || '',
            inviteCode: sc.inviteCode || '',
            isCreated: true
          })
        }
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] party-create-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] party-create-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] party-create-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] party-create-card overflow monitor=on')
    }
  },
  methods: {
    onEditField(e) {
      const field = e.currentTarget.dataset.field
      const fieldLabels = {
        theme: '活动主题',
        date: '日期',
        time: '时间',
        location: '地点',
        guestCount: '预计人数'
      }
      const currentValue = this.data[field] || '未填写'
      const label = fieldLabels[field] || field
      console.info(`[ai-mode] party-create-card 编辑字段 ${label}，当前值：${currentValue}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `修改聚会信息：${label}（当前：${currentValue}）` },
          { type: 'api/call', data: { name: 'editPartyField', arguments: { field, label, currentValue } } }
        ]
      })
    },
    onCreate() {
      const { theme, date, time, location, guestCount } = this.data
      const args = {}
      if (theme) args.title = theme
      if (date) args.date = date
      if (time) args.time = time
      if (location) args.location = location
      console.info(`[ai-mode] party-create-card send api/call name=createParty args=${JSON.stringify(args)}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: theme ? `创建聚会：${theme}` : '创建聚会' },
          { type: 'api/call', data: { name: 'createParty', arguments: args } }
        ]
      })
    },
    onGetRecommendations() {
      console.info('[ai-mode] party-create-card send api/call name=getRecommendations')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '看看有什么推荐场所' },
          { type: 'api/call', data: { name: 'getRecommendations', arguments: {} } }
        ]
      })
    },
    onInviteFriends() {
      const { partyId } = this.data
      if (!partyId) return
      console.info(`[ai-mode] party-create-card send api/call name=inviteFriends args=${JSON.stringify({ partyId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '邀请好友' },
          { type: 'api/call', data: { name: 'inviteFriends', arguments: { partyId } } }
        ]
      })
    }
  }
})
