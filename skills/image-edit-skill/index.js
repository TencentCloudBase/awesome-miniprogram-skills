const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const editImage = require('./apis/editImage')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/image-edit-skill')

  skill.use(cloudMw)

  skill.registerAPI('editImage', editImage)
  console.log('[image-edit-skill] APIs registered')
}

registerAPIs()
