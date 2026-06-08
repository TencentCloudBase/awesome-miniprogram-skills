const {
  ensureCloudInit,
  errorResult,
  successResult
} = require('../utils/util')

async function getQueueProgress(params = {}) {
  console.info('[ai-mode] getQueueProgress 入口, params=', JSON.stringify(params))
  const ticketId = params && params.ticketId
  if (!ticketId) {
    return errorResult('缺少 ticketId。禁止直接查询排队进度，请先完成取号或使用真实票据。')
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: {
        action: 'getQueueProgress',
        ticketId
      }
    })

    if (result && result.code === 0 && result.data) {
      console.info('[ai-mode] getQueueProgress 云函数返回成功, ticketId=', ticketId)
      return buildSuccess(result.data)
    }

    return buildFallback(ticketId)
  } catch (err) {
    console.error('[ai-mode] getQueueProgress 出错:', err.message)
    return buildFallback(ticketId)
  }
}

function buildFallback(ticketId) {
  const ticket = wx.getStorageSync(`skills_queue_ticket_${ticketId}`)
  if (!ticket) {
    return errorResult('未找到有效排队票。禁止继续展示排队进度，请先让用户重新取号或提供真实票据。')
  }

  const progress = calcLocalProgress(ticket)
  return buildSuccess(progress)
}

function calcLocalProgress(ticket) {
  const elapsedMinutes = Math.floor((Date.now() - new Date(ticket.takeTime).getTime()) / 60000)
  const aheadCount = Math.max(ticket.aheadCount - Math.floor(elapsedMinutes / 3), 0)
  const currentNo = ticket.currentCallingNumber || 'A001'
  const currentIndex = parseInt(String(currentNo).replace(/\D/g, ''), 10) || 1
  const callingIndex = currentIndex + Math.floor((ticket.aheadCount - aheadCount) * 0.8)
  const currentCallingNumber = `A${String(callingIndex).padStart(3, '0')}`
  const remainingMinutes = Math.max(ticket.estimatedMinutes - elapsedMinutes, 0)

  let status = 'waiting'
  let statusText = '排队中'
  if (aheadCount <= 0 && remainingMinutes <= 2) {
    status = 'calling'
    statusText = '即将到号'
  }
  if (elapsedMinutes >= ticket.estimatedMinutes + 8) {
    status = 'completed'
    statusText = '已过号'
  }

  return {
    ticketId: ticket.ticketId,
    queueNumber: ticket.queueNumber,
    storeName: ticket.storeName,
    status,
    statusText,
    aheadCount,
    currentCallingNumber,
    remainingMinutes,
    isAlmostReady: aheadCount <= 2
  }
}

function buildSuccess(data) {
  return successResult(
    `已查询到当前排队进度，状态为「${data.statusText}」。请展示排队进度卡片，并引导用户按需刷新。禁止以纯文本展开完整票据详情。`,
    {
      ticketId: data.ticketId,
      queueNumber: data.queueNumber,
      storeName: data.storeName,
      status: data.status,
      statusText: data.statusText,
      aheadCount: data.aheadCount,
      currentCallingNumber: data.currentCallingNumber,
      remainingMinutes: data.remainingMinutes,
      isAlmostReady: data.isAlmostReady
    },
    {
      ticketId: data.ticketId
    }
  )
}

module.exports = getQueueProgress
