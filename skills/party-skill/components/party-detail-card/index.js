Component({
  data: {
    partyId: '',
    theme: '',
    date: '',
    time: '',
    location: '',
    guestCount: 0,
    status: '',
    statusText: '',
    inviteCode: '',
    createTime: '',
    recommendation: null,
    friends: []
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] party-detail-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] party-detail-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          partyId: sc.partyId || '',
          theme: sc.theme || '',
          date: sc.date || '',
          time: sc.time || '',
          location: sc.location || '',
          guestCount: sc.guestCount || 0,
          status: sc.status || '',
          statusText: sc.statusText || '',
          inviteCode: sc.inviteCode || '',
          createTime: sc.createTime || '',
          recommendation: sc.recommendation || null,
          friends: sc.friends || []
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] party-detail-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] party-detail-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] party-detail-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] party-detail-card overflow monitor=on')
    }
  },
  methods: {
    onInvite() {
      const { partyId } = this.data
      if (!partyId) return
      console.info(`[ai-mode] party-detail-card send api/call name=inviteFriends args=${JSON.stringify({ partyId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '邀请好友' },
          { type: 'api/call', data: { name: 'inviteFriends', arguments: { partyId } } }
        ]
      })
    }
  }
})
