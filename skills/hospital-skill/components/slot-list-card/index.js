const MOCK_DATA = [
  { slotId: 'slot_001', date: '2026-06-15', time: '09:00-09:30', doctorName: '张医生', doctorTitle: '主任医师', price: 50, available: true },
  { slotId: 'slot_002', date: '2026-06-15', time: '09:30-10:00', doctorName: '李医生', doctorTitle: '副主任医师', price: 40, available: true },
  { slotId: 'slot_003', date: '2026-06-15', time: '10:00-10:30', doctorName: '王医生', doctorTitle: '主治医师', price: 30, available: true }
]

Component({
  data: {
    items: [],
    hospitalId: '',
    deptId: ''
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
    // 待 CLI 修复后清理此段。
    attached() {
      const { isPreviewMode } = require('../../utils/util')
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] slot-list-card 预览模式，使用 mock 数据')
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          items: MOCK_DATA.slice(0, maxItems),
          hospitalId: 'hosp_001',
          deptId: 'dept_001'
        })
      }
    },
    created() {
      console.info('[ai-mode] slot-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] slot-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          hospitalId: sc.hospitalId || '',
          deptId: sc.deptId || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] slot-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] slot-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] slot-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] slot-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapBook(e) {
      const ds = e.currentTarget.dataset
      if (ds.available <= 0) return
      console.info(`[ai-mode] slot-list-card send api/call name=bookAppointment args=${JSON.stringify({
        hospitalId: ds.hospitalId,
        deptId: ds.deptId,
        slotId: ds.slotId,
        hospitalName: ds.hospitalName,
        deptName: ds.deptName,
        doctorName: ds.doctorName,
        doctorTitle: ds.doctorTitle,
        date: ds.date,
        time: ds.time,
        price: ds.price
      })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `预约${ds.hospitalName} ${ds.deptName} ${ds.doctorName} ${ds.date} ${ds.time}` },
          { type: 'api/call', data: {
            name: 'bookAppointment',
            arguments: {
              hospitalId: ds.hospitalId,
              deptId: ds.deptId,
              slotId: ds.slotId,
              hospitalName: ds.hospitalName,
              deptName: ds.deptName,
              doctorName: ds.doctorName,
              doctorTitle: ds.doctorTitle,
              date: ds.date,
              time: ds.time,
              price: ds.price
            }
          }}
        ]
      })
    }
  }
})
