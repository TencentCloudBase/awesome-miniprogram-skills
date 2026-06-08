// 注册所有原子接口
const searchProducts = require('./apis/searchProducts.js')
const getProductDetail = require('./apis/getProductDetail.js')
const checkStoreStock = require('./apis/checkStoreStock.js')
const placeOrder = require('./apis/placeOrder.js')

function registerAPIs() {
  // 创建 skill 实例，path 需与 app.json 中 agent.skills[].path 一致
  const skill = wx.modelContext.createSkill('skills/shopping-skill')

  // 注册原子接口，name 需与 mcp.json 中声明的一致
  skill.registerAPI('searchProducts', searchProducts)
  skill.registerAPI('getProductDetail', getProductDetail)
  skill.registerAPI('checkStoreStock', checkStoreStock)
  skill.registerAPI('placeOrder', placeOrder)

  console.log('[shopping-skill] APIs registered via createSkill')
}

registerAPIs()
