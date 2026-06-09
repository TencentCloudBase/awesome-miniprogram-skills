// components/greeting-card/index.js
Component({
  data: {
    message: '',
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] greeting-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)

      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] greeting-card 收到 Result:', JSON.stringify(sc))
        this.setData({ message: sc.message || '' })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] greeting-card overflow overflowed=${overflowed}`)
      })
      console.info('[ai-mode] greeting-card overflow monitor=on')
    }
  },
  methods: {
    onTap() {
      console.info('[ai-mode] greeting-card send api/call name=greet')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [{ type: 'text', text: '了解更多' }]
      })
    }
  }
})
