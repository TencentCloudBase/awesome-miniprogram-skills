// skills/hospital-skill/apis/getAvailableSlots.js
const {
  ensureCloudInit,
  successResult,
  defaultSlotsForDept
} = require('../utils/util')

async function getAvailableSlots(params = {}) {
  console.info('[ai-mode] getAvailableSlots 入口, params=', JSON.stringify(params))
  const hospitalId = (params && params.hospitalId) || ''
  const deptId = (params && params.deptId) || ''

  if (!hospitalId || !deptId) {
    return successResult(
      '缺少医院或科室信息，请先选择医院和科室。',
      { items: [], hospitalId, deptId },
      { hospitalId, deptId }
    )
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'getAvailableSlots', hospitalId, deptId }
    })

    const items = (result && result.code === 0 && result.data && result.data.items) || []
    console.info('[ai-mode] getAvailableSlots 云函数返回数量=', items.length)
    return buildResult(items, hospitalId, deptId)
  } catch (err) {
    console.error('[ai-mode] getAvailableSlots 出错:', err.message)
    return buildResult(defaultSlotsForDept(hospitalId, deptId), hospitalId, deptId)
  }
}

function buildResult(items, hospitalId, deptId) {
  const total = items.length
  if (total > 0) {
    return successResult(
      `找到 ${total} 个可预约时段，请展示时段选择卡片让用户选择。`,
      { items, total, hospitalId, deptId },
      { hospitalId, deptId }
    )
  }
  return successResult(
    '该科室当前没有可用时段。请展示空列表卡片，引导用户选择其他日期或科室。',
    { items: [], total: 0, hospitalId, deptId },
    { hospitalId, deptId }
  )
}

module.exports = getAvailableSlots
