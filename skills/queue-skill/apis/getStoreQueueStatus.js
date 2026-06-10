const {
  isPreviewMode,
  ensureCloudInit,
  errorResult,
  successResult,
  defaultStoreDetail
} = require('../utils/util')

async function getStoreQueueStatus(params = {}) {
  console.info('[ai-mode] getStoreQueueStatus 入口, params=', JSON.stringify(params))
  const storeId = params && params.storeId
  if (!storeId) {
    return errorResult('缺少 storeId。禁止直接查看门店排队状态，请先让用户从门店列表中选择具体门店。')
  }

  if (isPreviewMode()) {
    return buildFallback(storeId)
  }

  ensureCloudInit()
  const { result } = await wx.cloud.callFunction({
    name: 'queue-skill-handler',
    data: {
      action: 'getStoreQueueStatus',
      storeId
    }
  })

  if (result && result.code === 0 && result.data) {
    console.info('[ai-mode] getStoreQueueStatus 云函数返回成功, storeId=', storeId)
    return buildSuccess(result.data)
  }

  return buildFallback(storeId)
}

function buildFallback(storeId) {
  const store = defaultStoreDetail(storeId)
  if (!store) {
    return errorResult('未找到该门店的排队信息。禁止继续取号，请先重新选择门店。')
  }
  return buildSuccess({
    storeId: store.storeId,
    storeName: store.storeName,
    address: store.address,
    businessHours: store.businessHours,
    queueEnabled: store.queueEnabled,
    queueStatusText: store.queueEnabled ? '可取号' : '暂停取号',
    currentCallingNumber: store.currentCallingNumber,
    waitingCount: store.waitingCount,
    estimatedMinutes: store.estimatedMinutes
  })
}

function buildSuccess(data) {
  const actionText = data.queueEnabled
    ? '请展示门店排队状态卡片，并引导用户确认是否立即取号。'
    : '请展示门店排队状态卡片，并明确告知当前暂停取号，禁止继续发起取号。'

  return successResult(
    `已查询到门店「${data.storeName}」当前排队状态：${data.queueStatusText}，当前叫号 ${data.currentCallingNumber}。${actionText}禁止以纯文本列出完整门店状态。`,
    {
      storeId: data.storeId,
      storeName: data.storeName,
      address: data.address,
      businessHours: data.businessHours,
      queueEnabled: data.queueEnabled,
      queueStatusText: data.queueStatusText,
      currentCallingNumber: data.currentCallingNumber,
      waitingCount: data.waitingCount,
      estimatedMinutes: data.estimatedMinutes
    },
    {
      storeId: data.storeId
    }
  )
}

module.exports = getStoreQueueStatus
