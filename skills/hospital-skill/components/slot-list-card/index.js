Component({
  data: {
    items: [],
    hospitalId: '',
    deptId: ''
  },
  lifetimes: {
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
