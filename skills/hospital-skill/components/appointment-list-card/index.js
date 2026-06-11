const MOCK_DATA = [
  { appointmentId: 'apt_001', hospitalName: '协和医院', deptName: '呼吸内科', doctorName: '张医生', date: '2026-06-15', time: '09:00-09:30', status: 'confirmed' },
  { appointmentId: 'apt_002', hospitalName: '北京大学第一医院', deptName: '神经内科', doctorName: '李医生', date: '2026-06-16', time: '14:00-14:30', status: 'confirmed' },
  { appointmentId: 'apt_003', hospitalName: '中日友好医院', deptName: '骨科', doctorName: '王医生', date: '2026-06-17', time: '10:00-10:30', status: 'pending' }
]

Component({
  data: {
    items: []
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
    // 待 CLI 修复后清理此段。
    attached() {
      const { isPreviewMode } = require('../../utils/util')
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] appointment-list-card 预览模式，使用 mock 数据')
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          items: MOCK_DATA.slice(0, maxItems)
        })
      }
    },
    created() {
      console.info('[ai-mode] appointment-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] appointment-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || []
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] appointment-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] appointment-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] appointment-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] appointment-list-card overflow monitor=on')
    }
  },
  methods: {
    // 纯展示组件，无上行 tap 交互
  }
})
