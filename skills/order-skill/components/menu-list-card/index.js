// skills/order-skill/components/menu-list-card/index.js
Component({
  data: {
    restaurant: {},
    items: [],
    cart: [],
    cartCount: 0,
    cartTotal: 0
  },
  lifetimes: {
    created() {
      console.info('[ai-mode] menu-list-card created')
      const { NotificationType } = wx.modelContext
      const modelCtx = wx.modelContext.getContext(this)
      modelCtx.on(NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        console.info('[ai-mode] menu-list-card 收到 Result, items=', (sc.items || []).length)
        this.setData({
          restaurant: sc.restaurant || {},
          items: sc.items || [],
          cart: [],
          cartCount: 0,
          cartTotal: 0
        })
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      const { width, minHeight, maxHeight } = viewCtx.getDimensions()
      console.info(`[ai-mode] menu-list-card dimensions width=${width} minHeight=${minHeight} maxHeight=${maxHeight}`)
      viewCtx.on(NotificationType.Overflow, (data) => {
        const overflowed = !!(data && data.overflowHeight > 0)
        console.info(`[ai-mode] menu-list-card overflow overflowed=${overflowed} data=${JSON.stringify(data)}`)
      })
      console.info('[ai-mode] menu-list-card overflow monitor=on')
    }
  },
  methods: {
    onTapAdd(e) {
      const { itemId, itemName, itemPrice } = e.currentTarget.dataset
      console.info(`[ai-mode] menu-list-card 加入购物车 itemId=${itemId} name=${itemName}`)
      const cart = [...this.data.cart]
      const idx = cart.findIndex((c) => c.itemId === itemId)
      if (idx >= 0) {
        cart[idx].quantity += 1
      } else {
        cart.push({ itemId, name: itemName, price: itemPrice, quantity: 1 })
      }
      const cartCount = cart.reduce((s, c) => s + c.quantity, 0)
      const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0)
      this.setData({ cart, cartCount, cartTotal })
    },
    onTapOrder(e) {
      const { cart, restaurant } = this.data
      if (!cart || cart.length === 0) {
        console.info('[ai-mode] menu-list-card 购物车为空，不触发下单')
        return
      }
      console.info(`[ai-mode] menu-list-card send api/call name=placeOrder cartItems=${cart.length}`)
      wx.modelContext.getContext(this).sendFollowUpMessage({
        content: [
          { type: 'text', text: `在${restaurant.name}下单` },
          {
            type: 'api/call',
            data: {
              name: 'placeOrder',
              arguments: {
                restaurantId: restaurant.restaurantId,
                items: cart.map((c) => ({ itemId: c.itemId, name: c.name, price: c.price, quantity: c.quantity }))
              }
            }
          }
        ]
      })
    }
  }
})
