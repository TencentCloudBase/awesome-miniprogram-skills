Component({
  data: {
    items: [],
    keyword: ''
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] hospital-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] hospital-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          keyword: sc.keyword || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] hospital-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] hospital-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] hospital-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapDept(e) {
      const { hospitalId, hospitalName, deptId, deptName } = e.currentTarget.dataset
      console.info(`[ai-mode] hospital-list-card send api/call name=getAvailableSlots args=${JSON.stringify({ hospitalId, deptId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `查看${hospitalName} ${deptName}的挂号时段` },
          { type: 'api/call', data: { name: 'getAvailableSlots', arguments: { hospitalId, deptId } } }
        ]
      })
    }
  }
})
