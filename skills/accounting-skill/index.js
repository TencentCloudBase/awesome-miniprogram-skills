// skills/accounting-skill/index.js
const addRecord = require('./apis/addRecord')
const getRecords = require('./apis/getRecords')
const getStatistics = require('./apis/getStatistics')
const deleteRecord = require('./apis/deleteRecord')
const setBudget = require('./apis/setBudget')
const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/accounting-skill')

  skill.use(cloudMw)

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [accounting-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [accounting-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [accounting-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('addRecord', addRecord)
  skill.registerAPI('getRecords', getRecords)
  skill.registerAPI('getStatistics', getStatistics)
  skill.registerAPI('deleteRecord', deleteRecord)
  skill.registerAPI('setBudget', setBudget)

  console.info('[ai-mode] [accounting-skill] APIs registered via createSkill')
}

registerAPIs()
