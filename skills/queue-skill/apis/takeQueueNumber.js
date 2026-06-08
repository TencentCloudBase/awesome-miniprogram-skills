const {
  ensureCloudInit,
  errorResult,
  successResult,
  defaultStoreDetail,
  genTicketId
} = require('../utils/util')

async function takeQueueNumber(params = {}) {
  console.info('[ai-mode] takeQueueNumber 入口, params=', JSON.stringify(params))
  const storeId = params && params.storeId
  if (!storeId) {
    return errorResult('缺少 storeId。禁止直接取号，请先让用户选择具体门店并查看门店排队状态。')
  }

  try {
    ensureCloudInit()
    const { result } = await wx.cloud.callFunction({
      name: 'ai-handler',
      data: {
        action: 'takeQueueNumber',
        storeId,
        partySize: params.partySize,
        queueType: params.queueType
      }
    })

    if (result && result.code === 0 && result.data) {
      saveLocalTicket(result.data)
      console.info('[ai-mode] takeQueueNumber 云函数返回成功, ticketId=', result.data.ticketId)
      return buildSuccess(result.data)
    }

    return buildFallback(storeId, params)
  } catch (err) {
    console.error('[ai-mode] takeQueueNumber 出错:', err.message)
    return buildFallback(storeId, params)
  }
}

function buildFallback(storeId, params) {
  const store = defaultStoreDetail(storeId)
  if (!store) {
    return errorResult('未找到可取号的门店信息。禁止继续生成排队票，请先重新选择门店。')
  }
  if (!store.queueEnabled) {
    return errorResult(`门店「${store.storeName}」当前暂停取号。禁止向用户宣布已取号成功，请引导用户更换门店。`)
  }

  const queueNumber = `A${String(Math.floor(Math.random() * 90) + 10)}`
  const ticket = {
    ticketId: genTicketId(),
    queueNumber,
    storeId: store.storeId,
    storeName: store.storeName,
    aheadCount: store.waitingCount,
    estimatedMinutes: store.estimatedMinutes,
    takeTime: new Date().toISOString(),
    status: 'waiting',
    currentCallingNumber: store.currentCallingNumber,
    partySize: params.partySize || 2,
    queueType: params.queueType || 'dine_in'
  }
  saveLocalTicket(ticket)
  return buildSuccess(ticket)
}

function buildSuccess(data) {
  return successResult(
    `已成功生成排队票，号牌为 ${data.queueNumber}。请展示取号结果卡片，并引导用户查看排队进度。禁止在未拿到 ticketId 前宣称取号成功。`,
    {
      ticketId: data.ticketId,
      queueNumber: data.queueNumber,
      storeId: data.storeId,
      storeName: data.storeName,
      aheadCount: data.aheadCount,
      estimatedMinutes: data.estimatedMinutes,
      takeTime: data.takeTime,
      status: data.status
    },
    {
      ticketId: data.ticketId,
      storeId: data.storeId
    }
  )
}

function saveLocalTicket(ticket) {
  wx.setStorageSync(`skills_queue_ticket_${ticket.ticketId}`, ticket)
  wx.setStorageSync('skills_queue_current_ticket_id', ticket.ticketId)
}

module.exports = takeQueueNumber
