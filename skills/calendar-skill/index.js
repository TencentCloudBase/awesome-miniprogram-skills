// skills/calendar-skill/index.js
const addEvent = require('./apis/addEvent')
const getEvents = require('./apis/getEvents')
const updateEvent = require('./apis/updateEvent')
const deleteEvent = require('./apis/deleteEvent')
const subscribeReminder = require('./apis/subscribeReminder')
const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/calendar-skill')

  skill.use(cloudMw)

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [calendar-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [calendar-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [calendar-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('addEvent', addEvent)
  skill.registerAPI('getEvents', getEvents)
  skill.registerAPI('updateEvent', updateEvent)
  skill.registerAPI('deleteEvent', deleteEvent)
  skill.registerAPI('subscribeReminder', subscribeReminder)

  console.info('[ai-mode] [calendar-skill] APIs registered via createSkill')
}

registerAPIs()
