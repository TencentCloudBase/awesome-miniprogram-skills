// skills/payment-skill/index.js
const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const createPayment = require('./apis/createPayment')
const queryPayment = require('./apis/queryPayment')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/payment-skill')

  skill.use(cloudMw)

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

  skill.registerAPI('createPayment', createPayment)
  skill.registerAPI('queryPayment', queryPayment)

  console.info('[ai-mode] [payment-skill] APIs registered via createSkill')
}

registerAPIs()
