// skills/order-skill/index.js — 外卖点餐 Skill 注册入口
const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const searchRestaurants = require('./apis/searchRestaurants.js')
const getMenuItems = require('./apis/getMenuItems.js')
const placeOrder = require('./apis/placeOrder.js')
const getOrderStatus = require('./apis/getOrderStatus.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/order-skill')

  skill.use(cloudMw)

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [order-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [order-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [order-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('searchRestaurants', searchRestaurants)
  skill.registerAPI('getMenuItems', getMenuItems)
  skill.registerAPI('placeOrder', placeOrder)
  skill.registerAPI('getOrderStatus', getOrderStatus)

  console.info('[ai-mode] [order-skill] APIs registered via createSkill')
}

registerAPIs()
