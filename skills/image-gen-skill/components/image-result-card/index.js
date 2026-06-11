Component({
  data: {
    images: [],
    count: 0,
    currentIndex: 0
  },
  lifetimes: {
    created() {
      console.info('[image-gen-skill] image-result-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const meta = (data && data.result && data.result._meta) || {}
        const images = (meta.images || sc.images || []).map((img) => ({
          ...img,
          src: img.fileID || img.tempUrl || ''
        }))
        this.setData({
          images,
          count: images.length,
          currentIndex: 0
        })
      })

      try {
        const viewCtx = wx.modelContext.getViewContext(this)
        const dims = viewCtx.getDimensions()
        console.info('[image-gen-skill] dims:', dims)
      } catch (e) {
        console.info('[image-gen-skill] getDimensions skipped:', e.message)
      }
    }
  },
  methods: {
    onTapPreview(e) {
      const idx = e.currentTarget.dataset.index
      const images = this.data.images
      if (!images.length) return

      const urls = images.map(img => img.fileID || img.tempUrl).filter(Boolean)
      wx.previewMedia({
        sources: urls.map(url => ({ url, type: 'image' })),
        current: idx || 0
      })
    },
    onTapSave(e) {
      const idx = e.currentTarget.dataset.index
      const img = this.data.images[idx || this.data.currentIndex]
      if (!img) return

      const url = img.fileID || img.tempUrl
      if (!url) return

      if (img.fileID) {
        wx.cloud.getTempFileURL({
          fileList: [img.fileID]
        }).then((res) => {
          const realUrl = res.fileList[0]?.tempFileURL || url
          wx.saveImageToPhotosAlbum({ filePath: realUrl })
        }).catch(() => {
          wx.saveImageToPhotosAlbum({ filePath: url })
        })
      } else {
        wx.saveImageToPhotosAlbum({ filePath: url })
      }
    },
    onTapRegenerate() {
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '重新生成同样的图片' },
          {
            type: 'api/call',
            data: {
              name: 'generateImage',
              arguments: { prompt: this.data.images[0]?.revisedPrompt || '' }
            }
          }
        ]
      })
    },
    onTapChangeStyle(e) {
      const style = e.currentTarget.dataset.style
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `换用 ${style} 风格重新生成` },
          {
            type: 'api/call',
            data: {
              name: 'generateImage',
              arguments: {
                prompt: this.data.images[0]?.revisedPrompt || '',
                style
              }
            }
          }
        ]
      })
    },
    onSwiperChange(e) {
      this.setData({ currentIndex: e.detail.current })
    }
  }
})
