// skills/hospital-skill/index.js
const cloudMw = require('../_shared/mp-skills-shared/utils/cloud-middleware')
const searchHospitals = require('./apis/searchHospitals.js')
const getAvailableSlots = require('./apis/getAvailableSlots.js')
const bookAppointment = require('./apis/bookAppointment.js')
const getMyAppointments = require('./apis/getMyAppointments.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/hospital-skill')

  skill.use(cloudMw)

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [hospital-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [hospital-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [hospital-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('searchHospitals', searchHospitals)
  skill.registerAPI('getAvailableSlots', getAvailableSlots)
  skill.registerAPI('bookAppointment', bookAppointment)
  skill.registerAPI('getMyAppointments', getMyAppointments)

  console.info('[ai-mode] [hospital-skill] APIs registered via createSkill')
}

registerAPIs()

module.exports = { registerAPIs }
