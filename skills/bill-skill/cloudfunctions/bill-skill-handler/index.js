const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const bills = [
  { billId: 'B001', billName: '水费', billType: 'water', amount: 68.50, dueDate: '2026-06-15', status: 'unpaid', provider: '市水务集团' },
  { billId: 'B002', billName: '电费', billType: 'electricity', amount: 236.80, dueDate: '2026-06-20', status: 'unpaid', provider: '市电力公司' },
  { billId: 'B003', billName: '燃气费', billType: 'gas', amount: 45.20, dueDate: '2026-06-18', status: 'unpaid', provider: '市燃气集团' },
  { billId: 'B004', billName: '话费', billType: 'phone', amount: 99.00, dueDate: '2026-06-25', status: 'unpaid', provider: '中国移动' },
  { billId: 'B005', billName: '物业费', billType: 'property', amount: 320.00, dueDate: '2026-06-30', status: 'unpaid', provider: '万科物业' }
]
const historyBills = [
  { billId: 'H001', billName: '电费', billType: 'electricity', amount: 210.50, payTime: '2026-05-20T10:30:00', status: 'paid', provider: '市电力公司' },
  { billId: 'H002', billName: '水费', billType: 'water', amount: 55.00, payTime: '2026-05-15T14:20:00', status: 'paid', provider: '市水务集团' },
  { billId: 'H003', billName: '燃气费', billType: 'gas', amount: 38.60, payTime: '2026-05-18T09:15:00', status: 'paid', provider: '市燃气集团' }
]

async function handleGetBills() {
  return { code: 0, message: 'success', data: { items: bills } }
}

async function handlePayBill({ openid, billId, billName, amount, billType }) {
  if (!openid) return { code: -1, message: 'openid 不能为空', data: null }

  const bill = bills.find(b => b.billId === billId)
  if (!bill) return { code: -1, message: 'bill_not_found', data: null }

  const payTime = new Date().toISOString()
  const transactionId = `P${Date.now().toString(36).toUpperCase()}`

  try {
    await db.collection('bill_records').add({
      data: { openid, billId, billName, billType, amount, payTime, transactionId, createdAt: db.serverDate() }
    })
  } catch (e) {
    console.error('[bill-skill-handler] save bill_record failed:', e.message)
  }

  return {
    code: 0, message: 'success',
    data: { billId, billName, billType, amount, payTime, transactionId, status: 'paid' }
  }
}

async function handleGetPaymentHistory(uid) {
  if (!uid) return { code: -1, message: 'uid 不能为空', data: null }

  try {
    const res = await db.collection('bill_records')
      .where({ _openid: uid })
      .orderBy('payTime', 'desc')
      .get()
    return { code: 0, message: 'success', data: { items: res.data || [] } }
  } catch (e) {
    console.error('[bill-skill-handler] getPaymentHistory error:', e.message)
    return { code: 0, message: 'success', data: { items: historyBills } }
  }
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const uid = wxContext.OPENID || 'anonymous'
  const { action } = event
  console.log('[bill-skill-handler] action=', action, 'uid=', uid)
  switch (action) {
    case 'getBills': return handleGetBills()
    case 'payBill': return handlePayBill(event, uid)
    case 'getPaymentHistory': return handleGetPaymentHistory(uid)
    default: return { code: -1, message: `未知 action: ${action}` }
  }
}
