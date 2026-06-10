// skills/payment-skill/components/payment-card/index.js
Component({
  data: {
    status: 'paying',     // paying / success / fail
    orderId: '',
    totalAmount: 0,
    payTime: '',
    transactionId: '',
    errorMsg: '',
    _payParams: null
  },

  lifetimes: {
    created() {
      console.info('[ai-mode] payment-card created')
      const modelCtx = wx.modelContext.getContext(this)
      const { NotificationType } = wx.modelContext

      modelCtx.on(NotificationType.Result, (data) => {
        const result = (data && data.result) || {}
        const sc = result.structuredContent || {}
        console.info('[ai-mode] payment-card 收到 Result:', JSON.stringify(sc))

        if (sc.payParams) {
          this.setData({
            status: 'paying',
            orderId: sc.orderId,
            totalAmount: sc.totalAmount,
            _payParams: sc.payParams
          })
          this.doRequestPayment(sc.orderId, sc.payParams)
        } else if (sc.status) {
          this.setData({
            status: sc.status === 'success' ? 'success' : 'fail',
            orderId: sc.orderId,
            payTime: sc.payTime,
            transactionId: sc.transactionId,
            errorMsg: sc.status === 'fail' ? '支付失败' : ''
          })
        }
      })

      const viewCtx = wx.modelContext.getViewContext(this)
      viewCtx.on(NotificationType.Overflow, (evt) => {
        console.info('[ai-mode] payment-card overflow:', JSON.stringify(evt))
      })
    }
  },

  methods: {
    doRequestPayment(orderId, payParams) {
      console.info('[ai-mode] payment-card 调起 wx.requestPayment')

      if (!wx || typeof wx.requestPayment !== 'function') {
        this.setData({ status: 'fail', errorMsg: '当前环境不支持支付' })
        return
      }

      wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign,
        success: () => {
          console.info('[ai-mode] payment-card 支付成功')
          const ctx = wx.modelContext.getContext(this)
          ctx.sendFollowUpMessage({
            content: [
              { type: 'text', text: `订单 ${orderId} 支付成功，确认结果` },
              { type: 'api/call', data: { name: 'queryPayment', arguments: { orderId } } }
            ]
          })
        },
        fail: (err) => {
          console.error('[ai-mode] payment-card 支付失败:', err.errMsg || err)
          this.setData({ status: 'fail', errorMsg: err.errMsg || '支付取消' })
          const ctx = wx.modelContext.getContext(this)
          ctx.sendFollowUpMessage({
            content: [
              { type: 'text', text: `订单 ${orderId} 支付失败：${err.errMsg || '用户取消'}` }
            ]
          })
        }
      })
    },

    onRetry() {
      const payParams = this.data._payParams
      if (payParams) {
        this.setData({ status: 'paying', errorMsg: '' })
        this.doRequestPayment(this.data.orderId, payParams)
      }
    }
  }
})
