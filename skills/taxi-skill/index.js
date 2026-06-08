// skills/taxi-skill/index.js
const estimateTrip = require('./apis/estimateTrip')
const callTaxi = require('./apis/callTaxi')
const getTripStatus = require('./apis/getTripStatus')
const getTripHistory = require('./apis/getTripHistory')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/taxi-skill')

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [taxi-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [taxi-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [taxi-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('estimateTrip', estimateTrip)
  skill.registerAPI('callTaxi', callTaxi)
  skill.registerAPI('getTripStatus', getTripStatus)
  skill.registerAPI('getTripHistory', getTripHistory)

  console.info('[ai-mode] [taxi-skill] APIs registered via createSkill')
}

registerAPIs()
