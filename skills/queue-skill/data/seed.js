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

module.exports = {
  stores
}
