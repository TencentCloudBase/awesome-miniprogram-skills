Component({
  data: {
    originalImage: '',
    editedImage: '',
    editDescription: '',
    loading: true
  },
  lifetimes: {
    created() {
      console.info('[image-edit-skill] image-edit-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const meta = (data && data.result && data.result._meta) || {}

        const originalImage = meta.originalImage || sc.originalImage || ''
        const editedImageUrl = meta.editedImage || sc.editedFileID || sc.editedTempUrl || ''
        const editDescription = sc.editDescription || ''

        this.setData({
          originalImage,
          editedImage: editedImageUrl,
          editDescription,
          loading: false
        })
      })

      try {
        const viewCtx = wx.modelContext.getViewContext(this)
        const dims = viewCtx.getDimensions()
        console.info('[image-edit-skill] dims:', dims)
      } catch (e) {
        console.info('[image-edit-skill] getDimensions skipped:', e.message)
      }
    }
  },
  methods: {
    onTapPreviewOriginal() {
      if (this.data.originalImage) {
        wx.previewMedia({
          sources: [{ url: this.data.originalImage, type: 'image' }]
        })
      }
    },
    onTapPreviewEdited() {
      if (this.data.editedImage) {
        wx.previewMedia({
          sources: [{ url: this.data.editedImage, type: 'image' }]
        })
      }
    },
    onTapSave() {
      const url = this.data.editedImage
      if (!url) return
      wx.saveImageToPhotosAlbum({ filePath: url })
    },
    onTapReEdit() {
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `重新编辑图片，修改需求：${this.data.editDescription}` },
          {
            type: 'api/call',
            data: {
              name: 'editImage',
              arguments: {
                originalImage: this.data.originalImage,
                editDescription: this.data.editDescription
              }
            }
          }
        ]
      })
    }
  }
})
