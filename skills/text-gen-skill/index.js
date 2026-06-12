const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const generateText = require('./apis/generateText')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/text-gen-skill')

  skill.use(cloudMw)

  skill.registerAPI('generateText', generateText)
  console.log('[text-gen-skill] APIs registered')
}

registerAPIs()
