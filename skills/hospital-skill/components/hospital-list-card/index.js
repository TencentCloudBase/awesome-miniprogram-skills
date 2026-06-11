const MOCK_DATA = [
  { hospitalId: 'hosp_001', name: '协和医院', address: '北京市东城区', level: '三甲', distance: '2.5km', depts: ['呼吸内科', '心血管内科'] },
  { hospitalId: 'hosp_002', name: '北京大学第一医院', address: '北京市西城区', level: '三甲', distance: '3.8km', depts: ['神经内科', '消化内科'] },
  { hospitalId: 'hosp_003', name: '中日友好医院', address: '北京市朝阳区', level: '三甲', distance: '5.1km', depts: ['呼吸内科', '骨科'] }
]

Component({
  data: {
    items: [],
    keyword: ''
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
    // 待 CLI 修复后清理此段。
    attached() {
      const { isPreviewMode } = require('../../utils/util')
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] hospital-list-card 预览模式，使用 mock 数据')
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          items: MOCK_DATA.slice(0, maxItems),
          keyword: ''
        })
      }
    },
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
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] hospital-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] hospital-list-card getDimensions skipped:', e.message)
      }
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
