Component({
  data: {
    appointment: null
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
    // 待 CLI 修复后清理此段。
    attached() {
      const { isPreviewMode } = require('../../utils/util')
      if (isPreviewMode() && !this.data.appointment) {
        console.info('[ai-mode] booking-result-card 预览模式，使用 mock 数据')
        this.setData({
          appointment: {
            success: true,
            hospitalName: '协和医院',
            deptName: '呼吸内科',
            doctorName: '张医生',
            date: '2026-06-15',
            time: '09:00-09:30',
            price: 50
          }
        })
      }
    },
    created() {
      console.info('[ai-mode] booking-result-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] booking-result-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          appointment: sc.appointment || null
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] booking-result-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] booking-result-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] booking-result-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] booking-result-card overflow monitor=on')
    }
  },
  methods: {
    onTapViewRecords() {
      console.info('[ai-mode] booking-result-card send api/call name=getMyAppointments')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看我的挂号记录' },
          { type: 'api/call', data: { name: 'getMyAppointments', arguments: {} } }
        ]
      })
    }
  }
})
