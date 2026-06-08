const {
  ensureCloudInit,
  successResult,
  errorResult,
  getPartyById
} = require('../utils/util')

async function getPartyDetails(params = {}) {
  console.info('[ai-mode] getPartyDetails 入口, params=', JSON.stringify(params))
  const partyId = String((params && params.partyId) || '').trim()

  if (!partyId) {
    return errorResult(
      '缺少聚会活动 ID，请先创建或选择一个聚会。',
      null,
      { error: 'missing_partyId' }
    )
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: {
        action: 'getPartyDetails',
        partyId
      }
    })

    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] getPartyDetails 云函数返回成功')
      return buildResult(result.data)
    }
    console.info('[ai-mode] getPartyDetails 云函数返回异常, 走降级')
    return buildResult(buildDefaultDetail(partyId))
  } catch (err) {
    console.error('[ai-mode] getPartyDetails 出错:', err.message)
    return buildResult(buildDefaultDetail(partyId))
  }
}

function buildDefaultDetail(partyId) {
  return getPartyById(partyId)
}

function buildResult(data) {
  if (!data) {
    return errorResult(
      '未找到该聚会详情，请确认聚会 ID 是否正确。',
      null,
      { error: 'party_not_found' }
    )
  }

  const { theme, statusText } = data
  return successResult(
    `已找到聚会「${theme || '未命名'}」（${statusText || '未知'}）。请展示聚会详情卡片，包含活动信息和好友状态。`,
    data,
    { partyId: data.partyId }
  )
}

module.exports = getPartyDetails
