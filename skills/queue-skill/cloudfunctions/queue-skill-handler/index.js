const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const stores = [
  {
    storeId: 'S001',
    storeName: '望京SOHO店',
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区望京SOHO T1 B1',
    businessType: 'dine_in',
    businessHours: '10:00-22:00',
    distance: '320m',
    queueEnabled: true,
    currentCallingNumber: 'A018',
    waitingCount: 8,
    estimatedMinutes: 18,
    keywords: ['望京', 'soho', '朝阳']
  },
  {
    storeId: 'S002',
    storeName: '国贸店',
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区国贸商城 B1',
    businessType: 'dine_in',
    businessHours: '10:00-22:00',
    distance: '1.5km',
    queueEnabled: true,
    currentCallingNumber: 'A026',
    waitingCount: 4,
    estimatedMinutes: 10,
    keywords: ['国贸', 'cbd', '朝阳']
  },
  {
    storeId: 'S003',
    storeName: '三里屯店',
    city: '北京',
    district: '朝阳区',
    address: '北京市朝阳区三里屯太古里南区',
    businessType: 'dine_in',
    businessHours: '11:00-23:00',
    distance: '2.4km',
    queueEnabled: false,
    currentCallingNumber: 'A032',
    waitingCount: 0,
    estimatedMinutes: 0,
    keywords: ['三里屯', '太古里', '朝阳']
  }
]

function matchStores(keyword = '') {
  const q = String(keyword || '').trim().toLowerCase()
  const list = q
    ? stores.filter((item) =>
        [item.storeName, item.city, item.district, ...(item.keywords || [])]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    : stores
  return list.map((item) => ({
    storeId: item.storeId,
    storeName: item.storeName,
    distance: item.distance,
    waitingCount: item.waitingCount,
    estimatedMinutes: item.estimatedMinutes,
    queueEnabled: item.queueEnabled
  }))
}

function findStore(storeId) {
  return stores.find((item) => item.storeId === storeId) || null
}

async function handleSearchStores({ keyword }) {
  return {
    code: 0,
    message: 'success',
    data: {
      items: matchStores(keyword),
      keyword: String(keyword || '')
    }
  }
}

async function handleGetStoreQueueStatus({ storeId }) {
  const store = findStore(storeId)
  if (!store) {
    return { code: -1, message: 'store_not_found', data: null }
  }
  return {
    code: 0,
    message: 'success',
    data: {
      storeId: store.storeId,
      storeName: store.storeName,
      address: store.address,
      businessHours: store.businessHours,
      queueEnabled: store.queueEnabled,
      queueStatusText: store.queueEnabled ? '可取号' : '暂停取号',
      currentCallingNumber: store.currentCallingNumber,
      waitingCount: store.waitingCount,
      estimatedMinutes: store.estimatedMinutes
    }
  }
}

async function handleTakeQueueNumber({ storeId, partySize, queueType }) {
  const store = findStore(storeId)
  if (!store) {
    return { code: -1, message: 'store_not_found', data: null }
  }
  if (!store.queueEnabled) {
    return { code: -1, message: 'queue_disabled', data: null }
  }

  const now = new Date()
  const ticketId = `T${Date.now().toString(36).toUpperCase()}`
  const queueNumber = `A${String(Math.floor(Math.random() * 90) + 10)}`
  const data = {
    ticketId,
    queueNumber,
    storeId: store.storeId,
    storeName: store.storeName,
    aheadCount: store.waitingCount,
    estimatedMinutes: store.estimatedMinutes,
    takeTime: now.toISOString(),
    status: 'waiting',
    currentCallingNumber: store.currentCallingNumber,
    partySize: partySize || 2,
    queueType: queueType || 'dine_in'
  }

  try {
    await db.collection('queue_tickets').add({
      data: {
        ...data,
        createdAt: db.serverDate()
      }
    })
  } catch (e) {
    console.error('[queue-skill-handler] save queue_ticket failed:', e.message)
  }

  return { code: 0, message: 'success', data }
}

async function handleGetQueueProgress({ ticketId }) {
  try {
    const res = await db.collection('queue_tickets')
      .where({ ticketId })
      .limit(1)
      .get()

    if (!res.data || !res.data.length) {
      return { code: -1, message: 'ticket_not_found', data: null }
    }

    const ticket = res.data[0]
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
      code: 0,
      message: 'success',
      data: {
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
  } catch (err) {
    console.error('[queue-skill-handler] getQueueProgress error:', err.message)
    return { code: -1, message: err.message, data: null }
  }
}

exports.main = async (event) => {
  const { action } = event
  console.log('[queue-skill-handler] action=', action, 'event=', JSON.stringify(event))

  switch (action) {
    case 'searchStores':
      return handleSearchStores(event)
    case 'getStoreQueueStatus':
      return handleGetStoreQueueStatus(event)
    case 'takeQueueNumber':
      return handleTakeQueueNumber(event)
    case 'getQueueProgress':
      return handleGetQueueProgress(event)
    default:
      return {
        code: -1,
        message: `未知 action: ${action}`,
        data: null
      }
  }
}
