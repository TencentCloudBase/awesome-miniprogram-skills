const generateImage = require('./apis/generateImage')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/image-gen-skill')
  skill.registerAPI('generateImage', generateImage)
  console.log('[image-gen-skill] APIs registered')
}

registerAPIs()
