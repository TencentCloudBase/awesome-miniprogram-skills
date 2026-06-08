// skills/party-skill/index.js
// 注册所有原子接口
const createParty = require('./apis/createParty.js')
const getRecommendations = require('./apis/getRecommendations.js')
const inviteFriends = require('./apis/inviteFriends.js')
const getPartyDetails = require('./apis/getPartyDetails.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/party-skill')

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [party-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [party-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [party-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('createParty', createParty)
  skill.registerAPI('getRecommendations', getRecommendations)
  skill.registerAPI('inviteFriends', inviteFriends)
  skill.registerAPI('getPartyDetails', getPartyDetails)

  console.info('[ai-mode] [party-skill] APIs registered via createSkill')
}

registerAPIs()

module.exports = {}
