Page({
  data: {
    previewMode: false
  },
  onLoad() {
    const mode = wx.getStorageSync('mp_skills_preview_mode')
    this.setData({ previewMode: mode === true })
    console.log('[home] onLoad, previewMode=', this.data.previewMode)
  },
  onShow() {
    const mode = wx.getStorageSync('mp_skills_preview_mode')
    this.setData({ previewMode: mode === true })
  },
  onSetPreview() {
    wx.setStorageSync('mp_skills_preview_mode', true)
    this.setData({ previewMode: true })
    wx.showToast({ title: '已切换到本地数据', icon: 'none', duration: 1500 })
  },
  onSetFormal() {
    wx.setStorageSync('mp_skills_preview_mode', false)
    this.setData({ previewMode: false })
    wx.showToast({ title: '已切换到正式数据', icon: 'none', duration: 1500 })
  }
})
