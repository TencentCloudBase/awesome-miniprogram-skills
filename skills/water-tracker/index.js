const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const { addWaterRecord } = require('./apis/addWaterRecord')
const { getWaterRecords } = require('./apis/getWaterRecords')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/water-tracker')
  skill.use(cloudMw)
  skill.registerAPI('addWaterRecord', addWaterRecord)
  skill.registerAPI('getWaterRecords', getWaterRecords)
  console.info('[water-tracker] APIs registered via createSkill')
}
registerAPIs()
