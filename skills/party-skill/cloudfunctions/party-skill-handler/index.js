// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 推荐场所种子数据（来自 seed.js）
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
    keywords: ['日料', '国贸', '精致', '包间']
  }
]

// 好友种子数据（来自 seed.js）
const friends = [
  { friendId: 'F001', name: '小明', avatar: '', phone: '138****1234' },
  { friendId: 'F002', name: '小红', avatar: '', phone: '139****5678' },
  { friendId: 'F003', name: '大伟', avatar: '', phone: '137****9012' },
  { friendId: 'F004', name: '莉莉', avatar: '', phone: '136****3456' },
  { friendId: 'F005', name: '阿强', avatar: '', phone: '135****7890' }
]

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  switch (action) {
    case 'createParty': {
      const { title, date, location, invitees } = event
      if (!title || !date || !location) {
        return { code: -1, msg: '参数不完整' }
      }
      const partyId = 'P' + Date.now()
      const party = {
        partyId,
        title,
        date,
        location,
        invitees: invitees || [],
        status: 'planning',
        openid,
        createdAt: new Date()
      }
      await db.collection('parties').add({ data: party })
      return { code: 0, data: { partyId, status: 'planning' } }
    }

    case 'getRecommendations': {
      const { keyword, type } = event
      let results = recommendations
      if (keyword) {
        const kw = keyword.toLowerCase()
        results = results.filter(r =>
          r.name.includes(kw) ||
          r.keywords.some(k => k.includes(kw)) ||
          r.tags.some(t => t.includes(kw))
        )
      }
      if (type) {
        results = results.filter(r => r.type === type)
      }
      return { code: 0, data: results }
    }

    case 'inviteFriends': {
      const { partyId, friendIds } = event
      if (!partyId || !friendIds || !friendIds.length) {
        return { code: -1, msg: '参数不完整' }
      }
      const invitedList = friends.filter(f => friendIds.includes(f.friendId)).map(f => ({
        friendId: f.friendId,
        name: f.name,
        avatar: f.avatar,
        status: 'pending',
        statusText: '待回复'
      }))
      // 更新聚会邀请人列表
      const partyRes = await db.collection('parties').where({ partyId, openid }).get()
      if (partyRes.data.length === 0) {
        return { code: -1, msg: '聚会不存在' }
      }
      const existingInvitees = partyRes.data[0].invitees || []
      const mergedInvitees = [...existingInvitees]
      invitedList.forEach(inv => {
        if (!mergedInvitees.find(e => e.friendId === inv.friendId)) {
          mergedInvitees.push(inv)
        }
      })
      await db.collection('parties').where({ partyId, openid }).update({
        data: { invitees: mergedInvitees }
      })
      return { code: 0, data: { partyId, invitees: mergedInvitees } }
    }

    case 'getPartyDetails': {
      const { partyId } = event
      if (!partyId) {
        return { code: -1, msg: '缺少聚会ID' }
      }
      const res = await db.collection('parties').where({ partyId, openid }).get()
      if (res.data.length === 0) {
        return { code: -1, msg: '聚会不存在' }
      }
      return { code: 0, data: res.data[0] }
    }

    default:
      return { code: -1, msg: `未知 action: ${action}` }
  }
}
