// skills/bill-skill/index.js
const getBills = require('./apis/getBills.js')
const payBill = require('./apis/payBill.js')
const getPaymentHistory = require('./apis/getPaymentHistory.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/bill-skill')

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [bill-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [bill-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [bill-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('getBills', getBills)
  skill.registerAPI('payBill', payBill)
  skill.registerAPI('getPaymentHistory', getPaymentHistory)

  console.info('[ai-mode] [bill-skill] APIs registered via createSkill')
}

registerAPIs()
