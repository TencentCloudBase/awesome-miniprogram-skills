// skills/taxi-skill/components/calling-taxi-card/index.js
Component({
  data: {
    tripId: '',
    origin: '',
    destination: '',
    carTypeName: '',
    price: 0,
    status: '',
    statusText: '',
    callTime: '',
    estimatedWait: '',
    driverName: '',
    plateNumber: '',
    driverPhone: '',
    timerId: null,
    elapsedSeconds: 0,
    _formatElapsed: ''
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] calling-taxi-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] calling-taxi-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          tripId: sc.tripId || '',
          origin: sc.origin || '',
          destination: sc.destination || '',
          carTypeName: sc.carTypeName || '',
          price: sc.price || 0,
          status: sc.status || '',
          statusText: sc.statusText || '',
          callTime: sc.callTime || '',
          estimatedWait: sc.estimatedWait || '',
          driverName: sc.driverName || '',
          plateNumber: sc.plateNumber || '',
          driverPhone: sc.driverPhone || ''
        })
        if (sc.status === 'calling') {
          this._startTimer()
        }
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] calling-taxi-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] calling-taxi-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] calling-taxi-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] calling-taxi-card overflow monitor=on')
    },
    detached() {
      this._stopTimer()
    }
  },
  methods: {
    _startTimer() {
      this._stopTimer()
      const timerId = setInterval(() => {
        this.setData({ elapsedSeconds: this.data.elapsedSeconds + 1 })
      }, 1000)
      this.setData({ timerId })
    },
    _stopTimer() {
      if (this.data.timerId) {
        clearInterval(this.data.timerId)
        this.data.timerId = null
      }
    },
    _formatElapsed(seconds) {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    },
    onCancelTrip() {
      console.info('[ai-mode] calling-taxi-card 取消行程')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '取消当前叫车' },
          { type: 'api/call', data: { name: 'cancelTrip', arguments: { tripId: this.data.tripId } } }
        ]
      })
    },
    onRefreshStatus() {
      console.info('[ai-mode] calling-taxi-card 刷新状态')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '查看行程状态' },
          { type: 'api/call', data: { name: 'getTripStatus', arguments: { tripId: this.data.tripId } } }
        ]
      })
    }
  }
})
