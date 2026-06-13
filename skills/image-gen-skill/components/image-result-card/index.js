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
      modelCtx.on(NotificationType.Result, async (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const meta = (data && data.result && data.result._meta) || {}
        const rawImages = meta.images || sc.images || []

        // 转换 cloud:// fileID → HTTP URL（fileID 不能直接在 <image> 中展示）
        const fileIDs = rawImages.filter(img => img.fileID && img.fileID.startsWith('cloud://') && !img.tempUrl).map(img => img.fileID)
        let urlMap = {}
        if (fileIDs.length > 0) {
          try {
            const res = await wx.cloud.getTempFileURL({ fileList: fileIDs })
            res.fileList.forEach(item => { urlMap[item.fileID] = item.tempFileURL })
          } catch (e) {
            console.warn('[image-gen-skill] getTempFileURL failed:', e.message)
          }
        }

        const images = rawImages.map((img) => ({
          ...img,
          src: img.tempUrl || urlMap[img.fileID] || ''
        }))
        this.setData({
          images,
          count: images.length,
          currentIndex: 0
        })

        // 更新预览用的 URL 列表（同样标识 fileID 需要转换）
        this._previewUrls = images.map(img => img.tempUrl || urlMap[img.fileID]).filter(Boolean)
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const dims = viewCtx.getDimensions()
        console.info('[image-gen-skill] dims:', dims)
      } catch (e) {
        console.info('[image-gen-skill] getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info('[image-gen-skill] overflow overflowed=' + overflowed + ' data=' + JSON.stringify(data))
      })
      console.info('[image-gen-skill] overflow monitor=on')
    }
  },
  methods: {
    onTapPreview(e) {
      const idx = e.currentTarget.dataset.index
      const urls = this._previewUrls || []
      if (!urls.length) return
      wx.previewMedia({
        sources: urls.map(url => ({ url, type: 'image' })),
        current: idx || 0
      })
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
