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
        this.setData({
          items: [{
            hospitalId: 'hosp_001',
            name: '协和医院',
            address: '北京市东城区',
            level: '三甲',
            distance: '2.5km',
            depts: ['呼吸内科', '心血管内科']
          }],
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
