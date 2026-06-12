// skills/queue-skill/index.js
const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const searchStores = require('./apis/searchStores.js')
const getStoreQueueStatus = require('./apis/getStoreQueueStatus.js')
const takeQueueNumber = require('./apis/takeQueueNumber.js')
const getQueueProgress = require('./apis/getQueueProgress.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/queue-skill')

  skill.use(cloudMw)

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [queue-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [queue-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [queue-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('searchStores', searchStores)
  skill.registerAPI('getStoreQueueStatus', getStoreQueueStatus)
  skill.registerAPI('takeQueueNumber', takeQueueNumber)
  skill.registerAPI('getQueueProgress', getQueueProgress)

  console.info('[ai-mode] [queue-skill] APIs registered via createSkill')
}

registerAPIs()
