// skills/order-skill/apis/getMenuItems.js — 查看餐厅菜单与菜品
const {
  ensureCloudInit,
  successResult,
  errorResult,
  defaultRestaurantDetail
} = require('../utils/util')

async function getMenuItems(params = {}) {
  console.info('[ai-mode] getMenuItems 入口, params=', JSON.stringify(params))
  const restaurantId = params && params.restaurantId

  if (!restaurantId) {
    return errorResult('缺少 restaurantId 参数，请先通过 searchRestaurants 选择餐厅。禁止编造 restaurantId。')
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'getMenuItems', restaurantId }
    })

    if (result && result.code === 0 && result.data) {
      const { restaurant, menu } = result.data
      console.info('[ai-mode] getMenuItems 云函数返回, 菜品数=', (menu || []).length)
      return buildResult(restaurant, menu)
    }
    throw new Error('云函数返回数据异常')
  } catch (err) {
    console.error('[ai-mode] getMenuItems 出错:', err.message)
    const restaurant = defaultRestaurantDetail(restaurantId)
    if (!restaurant) {
      return errorResult(`未找到 ID 为「${restaurantId}」的餐厅。请返回餐厅列表重新选择。`)
    }
    return buildResult(restaurant, restaurant.menu || [])
  }
}

function buildResult(restaurant, menu) {
  if (!restaurant) {
    return errorResult('未找到餐厅信息。')
  }
  const total = (menu || []).length
  if (total > 0) {
    return successResult(
      `${restaurant.name} 共有 ${total} 道菜品。请展示菜单卡片，让用户选择想点的菜品并加入购物车。禁止以纯文本逐条列出菜品。`,
      {
        restaurant: {
          restaurantId: restaurant.restaurantId,
          name: restaurant.name,
          rating: restaurant.rating,
          monthlySales: restaurant.monthlySales,
          deliveryFee: restaurant.deliveryFee,
          estimatedMinutes: restaurant.estimatedMinutes,
          minOrder: restaurant.minOrder,
          tags: restaurant.tags,
          status: restaurant.status
        },
        items: menu,
        total
      },
      { restaurantId: restaurant.restaurantId }
    )
  }
  return successResult(
    `${restaurant.name} 暂无菜品数据。`,
    { restaurant: { restaurantId: restaurant.restaurantId, name: restaurant.name }, items: [], total: 0 },
    { restaurantId: restaurant.restaurantId }
  )
}

module.exports = getMenuItems
