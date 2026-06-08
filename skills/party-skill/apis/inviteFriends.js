const {
  ensureCloudInit,
  successResult,
  errorResult,
  getFriendList,
  getPartyById
} = require('../utils/util')

async function inviteFriends(params = {}) {
  console.info('[ai-mode] inviteFriends 入口, params=', JSON.stringify(params))
  const { partyId, friendIds, keyword } = params || {}

  if (!partyId) {
    return errorResult(
      '缺少聚会活动信息，请先创建聚会后再邀请好友。',
      null,
      { error: 'missing_partyId' }
    )
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: {
        action: 'inviteFriends',
        partyId,
        friendIds: friendIds || []
      }
    })

    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] inviteFriends 云函数返回成功')
      return buildResult(result.data, partyId)
    }
    console.info('[ai-mode] inviteFriends 云函数返回异常, 走降级')
    return buildResult(buildDefaultInviteData(partyId, friendIds, keyword), partyId)
  } catch (err) {
    console.error('[ai-mode] inviteFriends 出错:', err.message)
    return buildResult(buildDefaultInviteData(partyId, friendIds, keyword), partyId)
  }
}

function buildDefaultInviteData(partyId, friendIds, keyword) {
  const party = getPartyById(partyId)
  let allFriends = getFriendList()

  // Filter by keyword if provided
  if (keyword && keyword.trim()) {
    const kw = keyword.trim().toLowerCase()
    allFriends = allFriends.filter((f) => f.name.toLowerCase().includes(kw))
  }

  // If friendIds provided, mark selected ones
  if (friendIds && friendIds.length > 0) {
    const invited = friendIds.map((fid) => {
      const friend = allFriends.find((f) => f.friendId === fid)
      return friend || { friendId: fid, name: '未知', avatar: '', status: 'pending' }
    })
    return {
      partyId,
      friends: allFriends.map((f) => ({
        ...f,
        status: friendIds.includes(f.friendId) ? 'pending' : 'uninvited'
      })),
      invitedCount: friendIds.length,
      acceptedCount: 0
    }
  }

  // First call: show friend list
  return {
    partyId,
    friends: allFriends,
    invitedCount: 0,
    acceptedCount: 0
  }
}

function buildResult(data, partyId) {
  const { friends: friendList, invitedCount } = data

  if (invitedCount > 0) {
    return successResult(
      `已成功邀请 ${invitedCount} 位好友参加聚会。请展示邀请结果卡片，包含好友回复状态。`,
      data,
      { partyId }
    )
  }

  // Show friend selection list
  if (friendList && friendList.length > 0) {
    return successResult(
      '请展示好友列表卡片，让用户选择要邀请的好友。点击好友可发送邀请。',
      data,
      { partyId }
    )
  }

  return errorResult(
    '没有可邀请的好友列表。',
    null,
    { error: 'no_friends' }
  )
}

module.exports = inviteFriends
