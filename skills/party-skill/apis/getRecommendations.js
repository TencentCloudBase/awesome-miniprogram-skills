const {
  isPreviewMode,
  successResult,
  errorResult,
  filterRecommendations
} = require('../utils/util')

async function getRecommendations(params = {}) {
  console.info('[ai-mode] getRecommendations 入口, params=', JSON.stringify(params))
  const type = String((params && params.type) || '').trim()
  const keyword = String((params && params.keyword) || '').trim()

  if (isPreviewMode()) {
    return buildResult(filterRecommendations(type, keyword), type, keyword)
  }

  const { result } = await wx.cloud.callFunction({
    name: 'party-skill-handler',
    data: {
      action: 'getRecommendations',
      type,
      keyword
    }
  })

  if (result && result.code === 0 && result.data) {
    const items = result.data.items || []
    console.info('[ai-mode] getRecommendations 云函数返回数量=', items.length)
    return buildResult(items, type, keyword)
  }
  return errorResult(result?.message || '请求失败')
}

function buildResult(items, type, keyword) {
  const total = items.length
  const typeTextMap = { restaurant: '餐厅', party_house: '轰趴馆', ktv: 'KTV', outdoor: '户外' }
  const typeLabel = typeTextMap[type] || ''

  if (total > 0) {
    const prefix = typeLabel ? `已找到 ${total} 个${typeLabel}推荐` : `已找到 ${total} 个聚会场所推荐`
    return successResult(
      `${prefix}。请展示推荐列表卡片，让用户从卡片中选择一个场所。禁止以纯文本列出推荐详情。`,
      { items, total, type, keyword },
      { type, keyword }
    )
  }
  if (typeLabel) {
    return successResult(
      keyword
        ? `未找到与「${keyword}」相关的${typeLabel}推荐。请展示空列表卡片，并引导用户换一个关键词或类型。`
        : `当前没有${typeLabel}推荐。请展示空列表卡片，引导用户选择其他类型。`,
      { items: [], total: 0, type, keyword },
      { type, keyword }
    )
  }
  return successResult(
    keyword
      ? `未找到与「${keyword}」相关的聚会场所。请展示空列表卡片，引导用户换一个关键词。`
      : '当前没有可推荐的聚会场所。请稍后再试。',
    { items: [], total: 0, type, keyword },
    { type, keyword }
  )
}

module.exports = getRecommendations
