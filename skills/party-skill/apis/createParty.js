const {
  ensureCloudInit,
  successResult,
  errorResult,
  genPartyId,
  genInviteCode,
  addParty
} = require('../utils/util')

async function createParty(params = {}) {
  console.info('[ai-mode] createParty 入口, params=', JSON.stringify(params))
  const { title, date, time, location, type, description } = params || {}
  const theme = title || ''

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: {
        action: 'createParty',
        theme: theme,
        date: date || '',
        time: time || '',
        location: location || '',
        type: type || '',
        description: description || ''
      }
    })

    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] createParty 云函数返回成功')
      return buildResult(result.data)
    }
    console.info('[ai-mode] createParty 云函数返回异常, 走降级')
    return buildResult(buildDefaultParty(theme, date, time, location, type, description))
  } catch (err) {
    console.error('[ai-mode] createParty 出错:', err.message)
    return buildResult(buildDefaultParty(theme, date, time, location, type, description))
  }
}

function buildDefaultParty(theme, date, time, location, type, description) {
  const now = new Date().toISOString()
  const party = {
    partyId: genPartyId(),
    theme: theme || '新聚会',
    date: date || '',
    time: time || '',
    location: location || '',
    type: type || '',
    description: description || '',
    guestCount: 0,
    status: 'planning',
    createTime: now,
    inviteCode: genInviteCode()
  }
  addParty(party)
  return party
}

function buildResult(data) {
  const { partyId, theme, status, createTime, inviteCode } = data
  const themeText = data.theme || '新聚会'

  if (partyId) {
    return successResult(
      `已成功创建聚会「${themeText}」。请展示聚会创建成功卡片，包含活动详情和邀请码。引导用户下一步可以邀请好友或查看推荐场所。`,
      data,
      { partyId }
    )
  }
  return errorResult(
    '创建聚会失败，请稍后重试。',
    null,
    { error: 'create_failed' }
  )
}

module.exports = createParty
