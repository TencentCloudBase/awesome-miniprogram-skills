const recommendations = [
  {
    id: 'R001',
    name: '花园餐厅·望京店',
    type: 'restaurant',
    typeText: '餐厅',
    rating: 4.7,
    priceLevel: '中档',
    address: '北京市朝阳区望京SOHO T2 3F',
    distance: '320m',
    capacity: '4-20人',
    tags: ['精致料理', '包间', '适合聚会'],
    imageUrl: '',
    keywords: ['望京', '餐厅', '聚餐', '包间']
  },
  {
    id: 'R002',
    name: '老北京涮肉馆',
    type: 'restaurant',
    typeText: '餐厅',
    rating: 4.5,
    priceLevel: '平价',
    address: '北京市东城区东四北大街128号',
    distance: '2.1km',
    capacity: '2-12人',
    tags: ['火锅', '老字号', '热闹'],
    imageUrl: '',
    keywords: ['东城', '火锅', '涮肉', '聚餐']
  },
  {
    id: 'R003',
    name: '轰趴馆·欢乐空间',
    type: 'party_house',
    typeText: '轰趴馆',
    rating: 4.8,
    priceLevel: '中高档',
    address: '北京市朝阳区建国路88号SOHO现代城B1',
    distance: '1.5km',
    capacity: '8-30人',
    tags: ['KTV', '桌游', '台球', '剧本杀', '适合团建'],
    imageUrl: '',
    keywords: ['轰趴', '团建', '桌游', '剧本杀']
  },
  {
    id: 'R004',
    name: '唱响KTV·三里屯店',
    type: 'ktv',
    typeText: 'KTV',
    rating: 4.4,
    priceLevel: '中档',
    address: '北京市朝阳区三里屯太古里南区B1',
    distance: '2.4km',
    capacity: '2-20人',
    tags: ['豪华包间', '海量曲库', '酒水畅饮'],
    imageUrl: '',
    keywords: ['KTV', '唱歌', '三里屯', '娱乐']
  },
  {
    id: 'R005',
    name: '阳光露营基地',
    type: 'outdoor',
    typeText: '户外',
    rating: 4.6,
    priceLevel: '中档',
    address: '北京市怀柔区雁栖湖路18号',
    distance: '35km',
    capacity: '10-50人',
    tags: ['烧烤', '露营', '篝火', '亲近自然'],
    imageUrl: '',
    keywords: ['户外', '露营', '烧烤', '怀柔', '雁栖湖']
  },
  {
    id: 'R006',
    name: '日料·樱花亭',
    type: 'restaurant',
    typeText: '餐厅',
    rating: 4.3,
    priceLevel: '高档',
    address: '北京市朝阳区国贸商城北区4F',
    distance: '1.8km',
    capacity: '2-8人',
    tags: ['日料', '刺身', '私密包间', '约会'],
    imageUrl: '',
    keywords: ['日料', '国贸', '精致', '包间']
  }
]

const friends = [
  {
    friendId: 'F001',
    name: '小明',
    avatar: '',
    phone: '138****1234'
  },
  {
    friendId: 'F002',
    name: '小红',
    avatar: '',
    phone: '139****5678'
  },
  {
    friendId: 'F003',
    name: '大伟',
    avatar: '',
    phone: '137****9012'
  },
  {
    friendId: 'F004',
    name: '莉莉',
    avatar: '',
    phone: '136****3456'
  },
  {
    friendId: 'F005',
    name: '阿强',
    avatar: '',
    phone: '135****7890'
  }
]

const parties = [
  {
    partyId: 'P001',
    theme: '小明生日派对',
    date: '2026-06-15',
    time: '18:00',
    location: '望京',
    guestCount: 8,
    status: 'planning',
    statusText: '筹备中',
    inviteCode: 'PARTY-A1B2',
    createTime: '2026-06-01T10:00:00.000Z',
    recommendationId: 'R001',
    recommendation: {
      id: 'R001',
      name: '花园餐厅·望京店',
      typeText: '餐厅',
      address: '北京市朝阳区望京SOHO T2 3F'
    },
    friends: [
      { friendId: 'F001', name: '小明', avatar: '', status: 'organizer', statusText: '组织者' },
      { friendId: 'F002', name: '小红', avatar: '', status: 'accepted', statusText: '已接受' },
      { friendId: 'F003', name: '大伟', avatar: '', status: 'accepted', statusText: '已接受' },
      { friendId: 'F004', name: '莉莉', avatar: '', status: 'pending', statusText: '待回复' },
      { friendId: 'F005', name: '阿强', avatar: '', status: 'pending', statusText: '待回复' }
    ]
  },
  {
    partyId: 'P002',
    theme: '部门团建聚餐',
    date: '2026-06-20',
    time: '11:30',
    location: '国贸',
    guestCount: 12,
    status: 'planning',
    statusText: '筹备中',
    inviteCode: 'PARTY-C3D4',
    createTime: '2026-06-05T14:30:00.000Z',
    recommendationId: 'R003',
    recommendation: {
      id: 'R003',
      name: '轰趴馆·欢乐空间',
      typeText: '轰趴馆',
      address: '北京市朝阳区建国路88号SOHO现代城B1'
    },
    friends: [
      { friendId: 'F003', name: '大伟', avatar: '', status: 'organizer', statusText: '组织者' },
      { friendId: 'F001', name: '小明', avatar: '', status: 'accepted', statusText: '已接受' },
      { friendId: 'F005', name: '阿强', avatar: '', status: 'accepted', statusText: '已接受' },
      { friendId: 'F002', name: '小红', avatar: '', status: 'pending', statusText: '待回复' },
      { friendId: 'F004', name: '莉莉', avatar: '', status: 'declined', statusText: '已拒绝' }
    ]
  }
]

module.exports = {
  recommendations,
  friends,
  parties
}
