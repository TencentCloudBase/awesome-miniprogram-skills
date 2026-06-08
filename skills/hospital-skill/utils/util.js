// skills/hospital-skill/utils/util.js
const { hospitals } = require('../data/seed')

let _cloudInited = false

function ensureCloudInit() {
  if (_cloudInited) return
  if (!wx.cloud) throw new Error('当前环境不支持 wx.cloud')
  wx.cloud.init({ traceUser: true })
  _cloudInited = true
}

function errorResult(msg, structuredContent, meta) {
  const result = { isError: true, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

function successResult(msg, structuredContent, meta) {
  const result = { isError: false, content: [{ type: 'text', text: msg }] }
  if (structuredContent !== undefined) result.structuredContent = structuredContent
  if (meta !== undefined) result._meta = meta
  return result
}

/**
 * 根据关键词搜索医院（本地降级）
 */
function defaultHospitalList(keyword) {
  const q = String(keyword || '').trim().toLowerCase()
  const list = q
    ? hospitals.filter((h) => {
        const hay = [h.hospitalName, ...h.tags, h.level, h.address]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    : hospitals
  return list.map((h) => ({
    hospitalId: h.hospitalId,
    hospitalName: h.hospitalName,
    level: h.level,
    address: h.address,
    rating: h.rating,
    tags: h.tags,
    phone: h.phone,
    departments: h.departments.map((d) => ({
      deptId: d.deptId,
      deptName: d.deptName,
      desc: d.desc
    }))
  }))
}

/**
 * 根据医院ID获取完整医院信息
 */
function defaultHospitalDetail(hospitalId) {
  return hospitals.find((h) => h.hospitalId === hospitalId) || null
}

/**
 * 根据科室ID获取可用时段
 */
function defaultSlotsForDept(hospitalId, deptId) {
  const hospital = hospitals.find((h) => h.hospitalId === hospitalId)
  if (!hospital) return []
  const dept = hospital.departments.find((d) => d.deptId === deptId)
  if (!dept) return []
  return dept.slots.map((s) => ({
    ...s,
    hospitalName: hospital.hospitalName,
    deptName: dept.deptName
  }))
}

/**
 * 生成预约ID
 */
function genAppointmentId() {
  return `A${Date.now().toString(36).toUpperCase()}${String(Math.random()).slice(2, 6)}`
}

module.exports = {
  ensureCloudInit,
  errorResult,
  successResult,
  defaultHospitalList,
  defaultHospitalDetail,
  defaultSlotsForDept,
  genAppointmentId
}
