// skills/payment-skill/components/payment-card/index.js
Component({
    data: {
    status: 'idle',       // idle / paying / success / fail
    orderId: '',
    prepayId: '',
    totalAmount: 0,
    payTime: '',
    transactionId: '',
    errorMsg: '',
    _payParams: null       // 存储支付参数，用于重试
  },

  lifetimes: {
    created() {
      console.info('[ai-mode] payment-card created')
    },
    attached() {
      this._modelCtx = wx.modelContext.getContext(this)
      const { NotificationType } = wx.modelContext

      this._modelCtx.on(NotificationType.Result, (data) => {
        const result = (data && data.result) || {}
        const sc = result.structuredContent || {}
        console.info('[ai-mode] payment-card 收到 Result:', JSON.stringify(sc))

        if (sc.payParams) {
          // createPayment 返回，自动调起支付
          this.setData({
            status: 'paying',
            orderId: sc.orderId,
            prepayId: sc.prepayId,
            totalAmount: sc.totalAmount,
            _payParams: sc.payParams
          })
          this._doRequestPayment(sc.orderId, sc.payParams)
        } else if (sc.status) {
          // queryPayment 返回，展示结果
          this.setData({
            status: sc.status === 'success' ? 'success' : 'fail',
            orderId: sc.orderId,
            payTime: sc.payTime,
            transactionId: sc.transactionId,
            errorMsg: sc.status === 'fail' ? '支付失败' : ''
          })
        }
      })
    }
  },

  methods: {
    _doRequestPayment(orderId, payParams) {
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
          // 自动查询确认支付结果
          wx.modelContext.getContext(this).sendFollowUpMessage({
            content: [
              { type: 'text', text: `订单 ${orderId} 支付成功，确认结果` },
              { type: 'api/call', data: { name: 'queryPayment', arguments: { orderId } } }
            ]
          })
        },
        fail: (err) => {
          console.error('[ai-mode] payment-card 支付失败:', err)
          this.setData({ status: 'fail', errorMsg: err.errMsg || '支付取消' })
          // 通知 AI 支付失败
          wx.modelContext.getContext(this).sendFollowUpMessage({
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
        this._doRequestPayment(this.data.orderId, payParams)
      }
    }
  }
})
