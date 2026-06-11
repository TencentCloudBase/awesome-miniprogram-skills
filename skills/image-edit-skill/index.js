const editImage = require('./apis/editImage')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/image-edit-skill')
  skill.registerAPI('editImage', editImage)
  console.log('[image-edit-skill] APIs registered')
}

registerAPIs()
