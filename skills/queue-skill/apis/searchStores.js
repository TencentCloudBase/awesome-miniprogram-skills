const {
  isPreviewMode,
  ensureCloudInit,
  successResult,
  defaultStoreList
} = require('../utils/util')

async function searchStores(params = {}) {
  console.info('[ai-mode] searchStores 入口, params=', JSON.stringify(params))
  const keyword = String((params && params.keyword) || '').trim()

  if (isPreviewMode()) {
    return buildResult(defaultStoreList(keyword), keyword)
  }

  ensureCloudInit()
  const { result } = await wx.cloud.callFunction({
    name: 'queue-skill-handler',
    data: {
      action: 'searchStores',
      keyword
    }
  })

  const items = (result && result.code === 0 && result.data && result.data.items) || []
  console.info('[ai-mode] searchStores 云函数返回数量=', items.length)
  return buildResult(items, keyword)
}

function buildResult(items, keyword) {
  const total = items.length
  if (total > 0) {
    return successResult(
      `已找到 ${total} 家可选门店。请展示门店列表卡片，让用户从卡片中选择一家查看排队状态。禁止以纯文本列出门店详情。`,
      { items, total, keyword },
      { keyword }
    )
  }
  return successResult(
    keyword
      ? `未找到与「${keyword}」相关的门店。请展示空列表卡片，并引导用户换一个门店关键词。禁止编造门店。`
      : '当前没有可展示的门店。请展示空列表卡片，并引导用户稍后再试。',
    { items: [], total: 0, keyword },
    { keyword }
  )
}

module.exports = searchStores
