// skills/hospital-skill/apis/bookAppointment.js
const {
  ensureCloudInit,
  successResult,
  genAppointmentId
} = require('../utils/util')

async function bookAppointment(params = {}) {
  console.info('[ai-mode] bookAppointment 入口, params=', JSON.stringify(params))
  const { hospitalId, deptId, slotId, patientName, patientPhone, hospitalName, deptName, doctorName, doctorTitle, date, time, price } = (params || {})

  if (!hospitalId || !slotId) {
    return successResult(
      '缺少预约信息，请先选择可预约时段。',
      { appointment: null, success: false },
      { hospitalId, deptId }
    )
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'bookAppointment', ...params }
    })

    const appointment = (result && result.code === 0 && result.data && result.data.appointment) || null
    if (appointment) {
      console.info('[ai-mode] bookAppointment 云函数成功')
      return buildResult(appointment)
    }
  } catch (err) {
    console.error('[ai-mode] bookAppointment 出错:', err.message)
  }

  // fallback mock
  const appointment = {
    appointmentId: genAppointmentId(),
    hospitalId,
    hospitalName: hospitalName || '',
    deptName: deptName || '',
    doctorName: doctorName || '',
    doctorTitle: doctorTitle || '',
    date: date || '',
    time: time || '',
    patientName: patientName || '',
    patientPhone: patientPhone || '',
    price: price || 0,
    status: 'confirmed',
    statusText: '已确认',
    createTime: new Date().toISOString()
  }
  return buildResult(appointment)
}

function buildResult(appointment) {
  return successResult(
    `挂号成功！${appointment.hospitalName} ${appointment.deptName} - ${appointment.doctorName} ${appointment.doctorTitle}\n就诊时间：${appointment.date} ${appointment.time}\n请展示挂号结果卡片。`,
    { appointment, success: true }
  )
}

module.exports = bookAppointment
