Component({
  data: {
    items: []
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] todo-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] todo-list-card 收到 Result:', JSON.stringify(sc))
        const items = (sc.items || []).map((item = {}) => {
          const displayTitle = String(item.title || '').trim() || '未命名待办'
          const displayUpdatedText = String(item.updatedText || '').trim() || (item.done ? '已完成' : '待处理')
          return {
            ...item,
            displayTitle,
            displayUpdatedText
          }
        })
        this.setData({ items })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      try {
        const { width, minHeight, maxHeight } = viewCtx.getDimensions()
        console.info(`[ai-mode] todo-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      } catch (e) {
        console.info('[ai-mode] todo-list-card getDimensions skipped:', e.message)
      }
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] todo-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] todo-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapAdd() {
      console.info('[ai-mode] todo-list-card send follow up for add todo')
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: '我想新增一个待办，请先问我要记录什么事项。' }
        ]
      })
    },
    onTapToggle(e) {
      const { todoId, title } = e.currentTarget.dataset
      console.info(`[ai-mode] todo-list-card send api/call name=toggleTodo args=${JSON.stringify({ todoId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `切换${title}` },
          { type: 'api/call', data: { name: 'toggleTodo', arguments: { todoId } } }
        ]
      })
    },
    onTapDelete(e) {
      const { todoId, title } = e.currentTarget.dataset
      console.info(`[ai-mode] todo-list-card send api/call name=deleteTodo args=${JSON.stringify({ todoId })}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `删除${title}` },
          { type: 'api/call', data: { name: 'deleteTodo', arguments: { todoId } } }
        ]
      })
    }
  }
})
