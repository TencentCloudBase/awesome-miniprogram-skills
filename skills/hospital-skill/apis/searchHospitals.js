// skills/hospital-skill/apis/searchHospitals.js
const {
  ensureCloudInit,
  successResult,
  defaultHospitalList
} = require('../utils/util')

async function searchHospitals(params = {}) {
  console.info('[ai-mode] searchHospitals 入口, params=', JSON.stringify(params))
  const keyword = String((params && params.keyword) || '').trim()

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'searchHospitals', keyword }
    })

    const items = (result && result.code === 0 && result.data && result.data.items) || []
    console.info('[ai-mode] searchHospitals 云函数返回数量=', items.length)
    return buildResult(items, keyword)
  } catch (err) {
    console.error('[ai-mode] searchHospitals 出错:', err.message)
    return buildResult(defaultHospitalList(keyword), keyword)
  }
}

function buildResult(items, keyword) {
  const total = items.length
  if (total > 0) {
    return successResult(
      `已找到 ${total} 家医院，请展示医院列表卡片让用户选择。`,
      { items, total, keyword },
      { keyword }
    )
  }
  return successResult(
    keyword
      ? `未找到与「${keyword}」相关的医院。请展示空列表卡片，引导用户换一个关键词。`
      : '当前没有可展示的医院。请展示空列表卡片，引导用户稍后再试。',
    { items: [], total: 0, keyword },
    { keyword }
  )
}

module.exports = searchHospitals
