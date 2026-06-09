// skills/travel-skill/apis/planTrip.js
const {
  isPreviewMode,
  successResult,
  errorResult,
  defaultDestDetail
} = require('../utils/util')

async function planTrip(params = {}) {
  console.info('[ai-mode] planTrip 入口, params=', JSON.stringify(params))
  const destId = params && params.destId ? String(params.destId).trim() : ''

  if (!destId) {
    return successResult(
      '缺少目的地信息，请先选择一个目的地。',
      { dest: null, transport: [], hotels: [] },
      { destId: '' }
    )
  }

  if (isPreviewMode()) {
    console.info('[ai-mode] planTrip 预览模式')
    const dest = defaultDestDetail(destId)
    if (!dest) {
      return successResult(
        '未找到该目的地的信息。请返回列表重新选择。',
        { dest: null, transport: [], hotels: [] },
        { destId }
      )
    }
    return buildResult(
      { dest: mapDestBrief(dest), transport: dest.transport, hotels: dest.hotels },
      destId
    )
  }

  const { result } = await wx.cloud.callFunction({
    name: 'travel-skill-handler',
    data: { action: 'planTrip', destId }
  })
  if (result && result.code === 0 && result.data) {
    return buildResult(result.data, destId)
  }
  return errorResult(result?.message || '规划行程失败')
}

function mapDestBrief(dest) {
  return {
    destId: dest.destId,
    name: dest.name,
    cover: dest.cover,
    rating: dest.rating,
    description: dest.description,
    bestSeason: dest.bestSeason,
    bestSeasonDesc: dest.bestSeasonDesc,
    tags: dest.tags
  }
}

function buildResult(data, destId) {
  return successResult(
    `已获取「${data.dest ? data.dest.name : ''}」的行程规划方案，包含交通与住宿推荐。请展示行程规划卡片。`,
    {
      dest: data.dest || null,
      transport: data.transport || [],
      hotels: data.hotels || []
    },
    { destId }
  )
}

module.exports = planTrip
