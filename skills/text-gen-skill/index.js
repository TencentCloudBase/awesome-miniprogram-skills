const generateText = require('./apis/generateText')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/text-gen-skill')
  skill.registerAPI('generateText', generateText)
  console.log('[text-gen-skill] APIs registered')
}

registerAPIs()
