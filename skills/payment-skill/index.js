// skills/payment-skill/index.js
const createOrder = require('./apis/createOrder')
const queryOrder = require('./apis/queryOrder')
const closeOrder = require('./apis/closeOrder')
const refundOrder = require('./apis/refundOrder')
const queryRefund = require('./apis/queryRefund')
const transferMoney = require('./apis/transferMoney')
const queryTransfer = require('./apis/queryTransfer')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/payment-skill')

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [payment-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [payment-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [payment-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('createOrder', createOrder)
  skill.registerAPI('queryOrder', queryOrder)
  skill.registerAPI('closeOrder', closeOrder)
  skill.registerAPI('refundOrder', refundOrder)
  skill.registerAPI('queryRefund', queryRefund)
  skill.registerAPI('transferMoney', transferMoney)
  skill.registerAPI('queryTransfer', queryTransfer)

  console.info('[ai-mode] [payment-skill] APIs registered via createSkill')
}

registerAPIs()
