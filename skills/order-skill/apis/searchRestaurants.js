// skills/order-skill/apis/searchRestaurants.js — 搜索附近餐厅
const {
  isPreviewMode,
  successResult,
  errorResult,
  defaultRestaurantList
} = require('../utils/util')

async function searchRestaurants(params = {}) {
  console.info('[ai-mode] searchRestaurants 入口, params=', JSON.stringify(params))
  const keyword = String((params && params.keyword) || '').trim()

  if (isPreviewMode()) {
    return buildResult(defaultRestaurantList(keyword), keyword)
  }

  const { result } = await wx.cloud.callFunction({
    name: 'order-skill-handler',
    data: { action: 'searchRestaurants', keyword }
  })

  if (result && result.code === 0 && result.data) {
    const items = result.data.items || []
    console.info('[ai-mode] searchRestaurants 云函数返回数量=', items.length)
    return buildResult(items, keyword)
  }
  return errorResult(result?.message || '请求失败')
}

function buildResult(items, keyword) {
  const total = items.length
  if (total > 0) {
    return successResult(
      `已找到 ${total} 家可选餐厅。请展示餐厅列表卡片，让用户从卡片中选择餐厅查看菜单。禁止以纯文本列出餐厅详情。`,
      { items, total, keyword },
      { keyword }
    )
  }
  return successResult(
    keyword
      ? `未找到与「${keyword}」相关的餐厅。请展示空列表卡片，并引导用户换一个关键词搜索。禁止编造餐厅。`
      : '当前没有可展示的餐厅。请展示空列表卡片，并引导用户稍后再试。',
    { items: [], total: 0, keyword },
    { keyword }
  )
}

module.exports = searchRestaurants
