Component({
  data: {
    text: '',
    model: '',
    usage: null,
    truncated: false,
    displayText: '',
    maxPreviewLength: 300
  },
  lifetimes: {
    created() {
      console.info('[text-gen-skill] text-result-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const meta = (data && data.result && data.result._meta) || {}
        const text = sc.text || ''
        const model = sc.model || ''
        const usage = sc.usage || null
        const truncated = text.length > this.data.maxPreviewLength

        this.setData({
          text,
          model,
          usage,
          truncated,
          displayText: truncated ? text.slice(0, this.data.maxPreviewLength) + '...' : text
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const dims = viewCtx.getDimensions()
        console.info('[text-gen-skill] dims:', dims)
      } catch (e) {
        console.info('[text-gen-skill] getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info('[text-gen-skill] overflow overflowed=' + overflowed + ' data=' + JSON.stringify(data))
      })
      console.info('[text-gen-skill] overflow monitor=on')
    }
  },
  methods: {
    onTapRegenerate() {
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '重新生成同样的内容' },
          {
            type: 'api/call',
            data: {
              name: 'generateText',
              arguments: { prompt: this.data.text, model: this.data.model }
            }
          }
        ]
      })
    },
    onTapExpand() {
      this.setData({
        truncated: false,
        displayText: this.data.text
      })
    }
  }
})
