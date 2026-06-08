Component({
  data: {
    partyId: '',
    friends: [],
    invitedCount: 0,
    acceptedCount: 0,
    selectedIds: [],
    isSent: false
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] invite-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] invite-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          partyId: sc.partyId || '',
          friends: sc.friends || [],
          invitedCount: sc.invitedCount || 0,
          acceptedCount: sc.acceptedCount || 0,
          isSent: (sc.invitedCount || 0) > 0
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] invite-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] invite-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] invite-card overflow monitor=on')
    }
  },
  methods: {
    onToggleFriend(e) {
      const { friendid } = e.currentTarget.dataset
      let selected = [...this.data.selectedIds]
      const idx = selected.indexOf(friendid)
      if (idx > -1) {
        selected.splice(idx, 1)
      } else {
        selected.push(friendid)
      }
      this.setData({ selectedIds: selected })
    },
    onSendInvite() {
      const { partyId, selectedIds } = this.data
      if (!partyId || selectedIds.length === 0) return
      console.info(`[ai-mode] invite-card send api/call name=inviteFriends args=${JSON.stringify({ partyId, friendIds: selectedIds })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `邀请 ${selectedIds.length} 位好友` },
          { type: 'api/call', data: { name: 'inviteFriends', arguments: { partyId, friendIds: selectedIds } } }
        ]
      })
    }
  }
})
