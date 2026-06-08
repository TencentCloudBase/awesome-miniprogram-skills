// skills/travel-skill/index.js
const searchDestinations = require('./apis/searchDestinations.js')
const planTrip = require('./apis/planTrip.js')
const getWeatherInfo = require('./apis/getWeatherInfo.js')
const getTravelTips = require('./apis/getTravelTips.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/travel-skill')

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [travel-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [travel-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [travel-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('searchDestinations', searchDestinations)
  skill.registerAPI('planTrip', planTrip)
  skill.registerAPI('getWeatherInfo', getWeatherInfo)
  skill.registerAPI('getTravelTips', getTravelTips)

  console.info('[ai-mode] [travel-skill] APIs registered via createSkill')
}

registerAPIs()

module.exports = { registerAPIs }
