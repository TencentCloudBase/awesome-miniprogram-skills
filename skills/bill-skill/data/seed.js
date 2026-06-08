const bills = [
  {
    billId: 'B001',
    billType: 'water',
    billTypeText: '水费',
    provider: '北京市自来水集团',
    accountNo: 'WZ20240815001',
    amount: 126.50,
    dueDate: '2026-06-25',
    status: 'unpaid',
    overdue: false,
    address: '朝阳区望京花园东区3号楼1单元502'
  },
  {
    billId: 'B002',
    billType: 'electricity',
    billTypeText: '电费',
    provider: '国网北京电力',
    accountNo: 'ED20240512008',
    amount: 328.70,
    dueDate: '2026-06-20',
    status: 'unpaid',
    overdue: true,
    address: '朝阳区望京花园东区3号楼1单元502'
  },
  {
    billId: 'B003',
    billType: 'gas',
    billTypeText: '燃气费',
    provider: '北京市燃气集团',
    accountNo: 'GQ20231103015',
    amount: 85.00,
    dueDate: '2026-06-28',
    status: 'unpaid',
    overdue: false,
    address: '朝阳区望京花园东区3号楼1单元502'
  },
  {
    billId: 'B004',
    billType: 'phone',
    billTypeText: '话费',
    provider: '中国移动',
    accountNo: '138****5678',
    amount: 50.00,
    dueDate: '2026-06-30',
    status: 'unpaid',
    overdue: false,
    address: ''
  },
  {
    billId: 'B005',
    billType: 'property',
    billTypeText: '物业费',
    provider: '望京花园物业管理处',
    accountNo: 'WY2026Q2',
    amount: 560.00,
    dueDate: '2026-07-05',
    status: 'unpaid',
    overdue: false,
    address: '朝阳区望京花园东区3号楼1单元502'
  }
]

const paymentHistory = [
  {
    historyId: 'H001',
    billType: 'water',
    billTypeText: '水费',
    provider: '北京市自来水集团',
    accountNo: 'WZ20240815001',
    amount: 115.30,
    payTime: '2026-05-18 14:32:10',
    payMethod: '微信支付',
    status: 'success'
  },
  {
    historyId: 'H002',
    billType: 'electricity',
    billTypeText: '电费',
    provider: '国网北京电力',
    accountNo: 'ED20240512008',
    amount: 286.40,
    payTime: '2026-05-10 09:15:42',
    payMethod: '微信支付',
    status: 'success'
  },
  {
    historyId: 'H003',
    billType: 'gas',
    billTypeText: '燃气费',
    provider: '北京市燃气集团',
    accountNo: 'GQ20231103015',
    amount: 72.00,
    payTime: '2026-04-22 19:48:05',
    payMethod: '零钱',
    status: 'success'
  }
]

module.exports = {
  bills,
  paymentHistory
}
