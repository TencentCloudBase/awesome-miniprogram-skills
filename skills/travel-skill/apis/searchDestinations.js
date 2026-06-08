// skills/travel-skill/apis/searchDestinations.js
const {
  ensureCloudInit,
  successResult,
  defaultDestinations
} = require('../utils/util')

async function searchDestinations(params = {}) {
  console.info('[ai-mode] searchDestinations 入口, params=', JSON.stringify(params))
  const keyword = String((params && params.keyword) || '').trim()

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: { action: 'searchDestinations', keyword }
    })
    const items = (result && result.code === 0 && result.data && result.data.items) || []
    console.info('[ai-mode] searchDestinations 云函数返回数量=', items.length)
    return buildResult(items, keyword)
  } catch (err) {
    console.error('[ai-mode] searchDestinations 出错:', err.message)
    return buildResult(defaultDestinations(keyword), keyword)
  }
}

function buildResult(items, keyword) {
  const total = items.length
  if (total > 0) {
    return successResult(
      `已找到 ${total} 个热门旅行目的地。请展示目的地列表卡片，让用户从卡片中选择一个查看详情并规划行程。禁止以纯文本列出目的地详情。`,
      { items, total, keyword },
      { keyword }
    )
  }
  return successResult(
    keyword
      ? `未找到与「${keyword}」相关的目的地。请展示空列表卡片，并引导用户换一个关键词搜索。`
      : '当前没有可展示的目的地。请展示空列表卡片，并引导用户稍后再试。',
    { items: [], total: 0, keyword },
    { keyword }
  )
}

module.exports = searchDestinations
