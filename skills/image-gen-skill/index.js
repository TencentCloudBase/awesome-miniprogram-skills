const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const generateImage = require('./apis/generateImage')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/image-gen-skill')

  skill.use(cloudMw)

  skill.registerAPI('generateImage', generateImage)
  console.log('[image-gen-skill] APIs registered')
}

registerAPIs()
