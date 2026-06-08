// skills/travel-skill/apis/getTravelTips.js
const {
  ensureCloudInit,
  successResult,
  defaultTips
} = require('../utils/util')

async function getTravelTips(params = {}) {
  console.info('[ai-mode] getTravelTips 入口, params=', JSON.stringify(params))

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'getTravelTips' }
    })
    const items = (result && result.code === 0 && result.data && result.data.items) || []
    console.info('[ai-mode] getTravelTips 云函数返回数量=', items.length)
    return buildResult(items)
  } catch (err) {
    console.error('[ai-mode] getTravelTips 出错:', err.message)
    return buildResult(defaultTips())
  }
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
