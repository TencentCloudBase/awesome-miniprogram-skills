Page({
  data: {
    previewMode: true
  },
  onLoad() {
    const mode = wx.getStorageSync('mp_skills_preview_mode')
    this.setData({ previewMode: mode !== false })
    console.log('[home] onLoad, previewMode=', this.data.previewMode)
  },
  onShow() {
    const mode = wx.getStorageSync('mp_skills_preview_mode')
    this.setData({ previewMode: mode !== false })
  },
  onToggleMode() {
    const newMode = !this.data.previewMode
    wx.setStorageSync('mp_skills_preview_mode', newMode)
    this.setData({ previewMode: newMode })
    wx.showToast({
      title: newMode ? '预览模式' : '正式模式',
      icon: 'none',
      duration: 1500
    })
    console.log('[home] mode switched to', newMode ? 'preview' : 'formal')
  },
  onTapMoreDrinks() {
    wx.navigateTo({ url: '/packageDetail/pages/more-drinks' })
  },
  onTapSkuPicker() {
    wx.navigateTo({ url: '/packageDetail/pages/sku-picker?drinkId=289' })
  },
  onTapAddressEdit() {
    wx.navigateTo({ url: '/packageDetail/pages/address-edit' })
  }
})
