Page({
  data: {
    greeting: 'AI 小程序已就绪'
  },
  onLoad() {
    // 页面加载后可获取云开发实例
    if (wx.cloud) {
      wx.cloud.callFunction({ name: 'getOpenId' }).then(res => {
        console.log('[app] openid:', res.result)
      }).catch(() => {})
    }
  }
})
