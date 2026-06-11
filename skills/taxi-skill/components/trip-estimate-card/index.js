// skills/taxi-skill/components/trip-estimate-card/index.js
const { isPreviewMode } = require('../../utils/util')

const MOCK_ESTIMATES = [
  { carTypeId: 'express', carTypeName: '快车', price: 68, eta: 8, seats: 4 },
  { carTypeId: 'comfort', carTypeName: '舒适型', price: 88, eta: 10, seats: 4 },
  { carTypeId: 'premium', carTypeName: '豪华车', price: 128, eta: 12, seats: 4 }
]

Component({
  data: {
    origin: '',
    destination: '',
    estimates: [],
    selectedCarType: 'express',
    selectedCarName: '快车'
  },
  lifetimes: {
    // TODO: cli agent render 截图时序问题的临时兼容（Result 通知送达晚于截图时机）。
    // 待 CLI 修复后清理此段。
    attached() {
      if (isPreviewMode() && this.data.estimates.length === 0) {
        console.info('[ai-mode] trip-estimate-card 预览模式，使用 mock 估算数据')
        let maxItems = 3
        try {
          const viewCtx = wx.modelContext.getViewContext(this)
          const { maxHeight } = viewCtx.getDimensions()
          maxItems = Math.max(1, Math.min(3, Math.floor((maxHeight - 150) / 200)))
        } catch (e) { }
        this.setData({
          origin: '望京SOHO',
          destination: '首都机场',
          estimates: MOCK_ESTIMATES.slice(0, maxItems),
          selectedCarType: 'express',
          selectedCarName: '快车'
        })
      }
    },
    created() {
      console.info('[ai-mode] trip-estimate-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] trip-estimate-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          origin: sc.origin || '',
          destination: sc.destination || '',
          estimates: sc.estimates || [],
          selectedCarType: (sc.selectedEstimate && sc.selectedEstimate.carTypeId) || 'express',
          selectedCarName: (sc.estimates && sc.estimates.find(e => e.carTypeId === (sc.selectedEstimate && sc.selectedEstimate.carTypeId || 'express'))?.carTypeName) || '快车'
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] trip-estimate-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] trip-estimate-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] trip-estimate-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] trip-estimate-card overflow monitor=on')
    }
  },
  methods: {
    onSelectCarType(e) {
      const { carType } = e.currentTarget.dataset
      const estimate = this.data.estimates.find(e => e.carTypeId === carType) || {}
      const carName = estimate.carTypeName || '快车'
      this.setData({ selectedCarType: carType, selectedCarName: carName })
      console.info(`[ai-mode] trip-estimate-card 选择车型: ${carName}(${carType})`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `选择${carName}` },
          { type: 'api/call', data: { name: 'estimateTrip', arguments: { selectedCarType: carType } } }
        ]
      })
    },
    onCallTaxi() {
      const { origin, destination, selectedCarType } = this.data
      const carTypeName = (this.data.estimates.find(e => e.carTypeId === selectedCarType) || {}).carTypeName || '快车'
      console.info(`[ai-mode] trip-estimate-card send api/call name=callTaxi args=${JSON.stringify({ origin, destination, carType: selectedCarType })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `呼叫${carTypeName}，从${origin}到${destination}` },
          { type: 'api/call', data: { name: 'callTaxi', arguments: { origin, destination, carType: selectedCarType } } }
        ]
      })
    }
  }
})
