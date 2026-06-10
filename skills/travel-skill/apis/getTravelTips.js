// skills/travel-skill/apis/getTravelTips.js
const {
  isPreviewMode,
  successResult,
  errorResult,
  defaultTips
} = require('../utils/util')

async function getTravelTips(params = {}) {
  console.info('[ai-mode] getTravelTips 入口, params=', JSON.stringify(params))

  if (isPreviewMode()) {
    console.info('[ai-mode] getTravelTips 预览模式')
    return buildResult(defaultTips())
  }

  const { result } = await wx.cloud.callFunction({
    name: 'travel-skill-handler',
    data: { action: 'getTravelTips' }
  })
  const items = (result && result.code === 0 && result.data && result.data.items) || []
  console.info('[ai-mode] getTravelTips 云函数返回数量=', items.length)
  if (items.length) {
    return buildResult(items)
  }
  return errorResult(result?.message || '获取旅行贴士失败')
}

function buildResult(items) {
  if (items && items.length > 0) {
    return successResult(
      `为你准备了 ${items.length} 条实用旅行贴士。请展示贴士卡片，让用户浏览查看。`,
      { items },
      {}
    )
  }
  return successResult(
    '暂无旅行贴士。请稍后再试。',
    { items: [] },
    {}
  )
}

module.exports = getTravelTips
