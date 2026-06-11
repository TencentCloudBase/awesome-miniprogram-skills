// skills/travel-skill/components/destination-list-card/index.js
const { isPreviewMode } = require('../../utils/util')

const MOCK_DATA = [
  { destId: 'dest_001', name: '北京', description: '千年古都，现代都市', rating: 4.8, tags: ['文化', '历史'] },
  { destId: 'dest_002', name: '上海', description: '东方明珠，时尚之都', rating: 4.7, tags: ['购物', '美食'] },
  { destId: 'dest_003', name: '成都', description: '天府之国，美食之都', rating: 4.9, tags: ['美食', '休闲'] }
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
      if (isPreviewMode() && this.data.items.length === 0) {
        console.info('[ai-mode] destination-list-card 预览模式，使用 mock 数据')
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
      console.info('[ai-mode] destination-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] destination-list-card 收到 Result:', JSON.stringify(sc))
        this.setData({
          items: sc.items || [],
          keyword: sc.keyword || ''
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] destination-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] destination-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] destination-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] destination-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapPlan(e) {
      const { destId, name } = e.currentTarget.dataset
      console.info(`[ai-mode] destination-list-card send api/call name=planTrip args=${JSON.stringify({ destId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `规划${name}行程` },
          { type: 'api/call', data: { name: 'planTrip', arguments: { destId } } }
        ]
      })
    },
    onTapWeather(e) {
      const { destId, name } = e.currentTarget.dataset
      console.info(`[ai-mode] destination-list-card send api/call name=getWeatherInfo args=${JSON.stringify({ destId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `${name}天气` },
          { type: 'api/call', data: { name: 'getWeatherInfo', arguments: { destId } } }
        ]
      })
    }
  }
})
