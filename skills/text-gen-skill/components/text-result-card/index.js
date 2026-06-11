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
    }
  },
  methods: {
    onTapCopy() {
      const text = this.data.text
      if (!text) return
      wx.setClipboardData({
        data: text,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success', duration: 1500 })
        }
      })
    },
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
    onTapChangeModel(e) {
      const newModel = e.currentTarget.dataset.model
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `换用 ${newModel} 模型重新生成` },
          {
            type: 'api/call',
            data: {
              name: 'generateText',
              arguments: { prompt: this.data.text, model: newModel }
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
