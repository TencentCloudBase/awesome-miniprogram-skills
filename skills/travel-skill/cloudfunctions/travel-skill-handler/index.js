// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 目的地种子数据（来自 seed.js）
const destinations = [
  {
    destId: 'D001',
    name: '三亚',
    nameEn: 'Sanya',
    cover: 'https://picsum.photos/seed/sanya/400/300',
    rating: 4.8,
    description: '中国最美海滨城市，热带天堂，阳光、沙滩、椰林与碧海蓝天。',
    bestSeason: '10月-次年4月',
    bestSeasonDesc: '气候宜人，避寒胜地',
    tags: ['海滨', '度假', '潜水'],
    transport: [
      { type: 'flight', label: '直飞航班', from: '北京', to: '三亚', duration: '3h50m', price: 680, carrier: '海南航空' },
      { type: 'flight', label: '直飞航班', from: '上海', to: '三亚', duration: '3h10m', price: 520, carrier: '东方航空' },
      { type: 'train', label: '动车', from: '海口', to: '三亚', duration: '1h30m', price: 108, carrier: '铁路12306' }
    ],
    hotels: [
      { name: '三亚海棠湾艾迪逊酒店', stars: 5, rating: 4.9, price: 1288, district: '海棠湾', features: ['私人沙滩', '无边泳池'] },
      { name: '三亚亚龙湾万豪度假酒店', stars: 5, rating: 4.7, price: 899, district: '亚龙湾', features: ['海景房', '亲子'] },
      { name: '三亚湾海居铂尔曼酒店', stars: 4, rating: 4.5, price: 499, district: '三亚湾', features: ['性价比高', '近市区'] }
    ]
  },
  {
    destId: 'D002',
    name: '丽江',
    nameEn: 'Lijiang',
    cover: 'https://picsum.photos/seed/lijiang/400/300',
    rating: 4.7,
    description: '世界文化遗产古城，雪山脚下的小桥流水人家，感受纳西族风情。',
    bestSeason: '3月-5月、9月-11月',
    bestSeasonDesc: '春暖花开或秋高气爽',
    tags: ['古城', '人文', '雪山'],
    transport: [
      { type: 'flight', label: '直飞航班', from: '北京', to: '丽江', duration: '4h', price: 880, carrier: '中国国航' },
      { type: 'flight', label: '直飞航班', from: '上海', to: '丽江', duration: '3h40m', price: 750, carrier: '吉祥航空' },
      { type: 'train', label: '动车', from: '昆明', to: '丽江', duration: '3h', price: 220, carrier: '铁路12306' }
    ],
    hotels: [
      { name: '丽江悦榕庄', stars: 5, rating: 4.8, price: 1580, district: '束河古镇', features: ['雪山景观', 'SPA'] },
      { name: '丽江古城英迪格酒店', stars: 5, rating: 4.6, price: 780, district: '大研古城', features: ['纳西风格', '古城内'] },
      { name: '丽江花间堂客栈', stars: 4, rating: 4.5, price: 380, district: '大研古城', features: ['特色民宿', '庭院'] }
    ]
  },
  {
    destId: 'D003',
    name: '成都',
    nameEn: 'Chengdu',
    cover: 'https://picsum.photos/seed/chengdu/400/300',
    rating: 4.9,
    description: '天府之国，美食之都，熊猫的故乡，体验慢生活与麻辣鲜香。',
    bestSeason: '3月-6月、9月-11月',
    bestSeasonDesc: '气温舒适，美食四季皆宜',
    tags: ['美食', '熊猫', '休闲'],
    transport: [
      { type: 'flight', label: '直飞航班', from: '北京', to: '成都', duration: '3h', price: 620, carrier: '四川航空' },
      { type: 'flight', label: '直飞航班', from: '上海', to: '成都', duration: '3h15m', price: 580, carrier: '东方航空' },
      { type: 'train', label: '高铁', from: '重庆', to: '成都', duration: '1h', price: 150, carrier: '铁路12306' }
    ],
    hotels: [
      { name: '成都博舍酒店', stars: 5, rating: 4.9, price: 1480, district: '太古里', features: ['设计感', '太古里核心'] },
      { name: '成都群光君悦酒店', stars: 5, rating: 4.7, price: 920, district: '春熙路', features: ['高空景观', '购物便利'] },
      { name: '成都春熙路亚朵酒店', stars: 4, rating: 4.6, price: 480, district: '春熙路', features: ['性价比', '舒适'] }
    ]
  },
  {
    destId: 'D004',
    name: '杭州',
    nameEn: 'Hangzhou',
    cover: 'https://picsum.photos/seed/hangzhou/400/300',
    rating: 4.8,
    description: '上有天堂下有苏杭，西湖美景天下闻名，江南水乡的诗意画卷。',
    bestSeason: '3月-5月、9月-11月',
    bestSeasonDesc: '烟雨江南最美时节',
    tags: ['西湖', '江南', '文化'],
    transport: [
      { type: 'flight', label: '直飞航班', from: '北京', to: '杭州', duration: '2h15m', price: 560, carrier: '中国国航' },
      { type: 'flight', label: '直飞航班', from: '广州', to: '杭州', duration: '2h', price: 480, carrier: '南方航空' },
      { type: 'train', label: '高铁', from: '上海', to: '杭州', duration: '45m', price: 73, carrier: '铁路12306' }
    ],
    hotels: [
      { name: '杭州西子湖四季酒店', stars: 5, rating: 4.9, price: 1880, district: '西湖', features: ['西湖景观', '园林'] },
      { name: '杭州柏悦酒店', stars: 5, rating: 4.8, price: 1180, district: '钱江新城', features: ['高空大堂', '江景'] },
      { name: '杭州全季酒店西湖店', stars: 4, rating: 4.5, price: 420, district: '西湖', features: ['位置佳', '简约'] }
    ]
  },
  {
    destId: 'D005',
    name: '大理',
    nameEn: 'Dali',
    cover: 'https://picsum.photos/seed/dali/400/300',
    rating: 4.7,
    description: '风花雪月，苍山洱海，白族文化的发源地，文艺青年的诗和远方。',
    bestSeason: '3月-5月、9月-11月',
    bestSeasonDesc: '洱海风光最美',
    tags: ['洱海', '文艺', '古镇'],
    transport: [
      { type: 'flight', label: '直飞航班', from: '北京', to: '大理', duration: '3h50m', price: 920, carrier: '东方航空' },
      { type: 'flight', label: '直飞航班', from: '成都', to: '大理', duration: '1h30m', price: 380, carrier: '四川航空' },
      { type: 'train', label: '动车', from: '昆明', to: '大理', duration: '2h', price: 145, carrier: '铁路12306' }
    ],
    hotels: [
      { name: '大理海纳尔云墅酒店', stars: 5, rating: 4.8, price: 1680, district: '洱海边', features: ['洱海全景', '无边泳池'] },
      { name: '大理古城一号院', stars: 4, rating: 4.6, price: 680, district: '大理古城', features: ['庭院', '白族建筑'] },
      { name: '大理双廊海景客栈', stars: 3, rating: 4.4, price: 320, district: '双廊', features: ['海景房', '文艺'] }
    ]
  },
  {
    destId: 'D006',
    name: '厦门',
    nameEn: 'Xiamen',
    cover: 'https://picsum.photos/seed/xiamen/400/300',
    rating: 4.6,
    description: '海上花园，鼓浪屿的琴声悠扬，闽南风情与文艺小清新的完美融合。',
    bestSeason: '3月-5月、10月-12月',
    bestSeasonDesc: '避暑避寒皆宜',
    tags: ['海岛', '文艺', '美食'],
    transport: [
      { type: 'flight', label: '直飞航班', from: '北京', to: '厦门', duration: '3h', price: 620, carrier: '厦门航空' },
      { type: 'flight', label: '直飞航班', from: '上海', to: '厦门', duration: '1h50m', price: 480, carrier: '东方航空' },
      { type: 'train', label: '高铁', from: '福州', to: '厦门', duration: '1h30m', price: 95, carrier: '铁路12306' }
    ],
    hotels: [
      { name: '厦门华尔道夫酒店', stars: 5, rating: 4.9, price: 1380, district: '思明区', features: ['奢华', '城市景观'] },
      { name: '厦门鼓浪屿林氏府酒店', stars: 4, rating: 4.6, price: 650, district: '鼓浪屿', features: ['百年别墅', '历史'] },
      { name: '厦门曾厝垵民宿', stars: 3, rating: 4.3, price: 280, district: '曾厝垵', features: ['文艺', '海边'] }
    ]
  }
]

// 天气模拟数据（来自 seed.js）
const weatherData = {
  D001: { temp: 30, condition: '晴', humidity: 70, wind: '3级', icon: '☀️', suggestion: '适宜海边活动，注意防晒' },
  D002: { temp: 18, condition: '多云', humidity: 55, wind: '2级', icon: '⛅', suggestion: '早晚温差大，建议携带外套' },
  D003: { temp: 24, condition: '阴', humidity: 65, wind: '2级', icon: '☁️', suggestion: '适宜户外活动，推荐火锅' },
  D004: { temp: 22, condition: '小雨', humidity: 80, wind: '3级', icon: '🌦️', suggestion: '建议携带雨具，雨中西湖别样美' },
  D005: { temp: 20, condition: '晴', humidity: 50, wind: '4级', icon: '☀️', suggestion: '洱海边风大，建议带防风外套' },
  D006: { temp: 26, condition: '多云', humidity: 72, wind: '3级', icon: '⛅', suggestion: '适宜环岛路骑行' }
}

// 旅行贴士（来自 seed.js）
const travelTips = [
  {
    id: 'T01',
    category: '行前准备',
    icon: '🎒',
    title: '提前预订省更多',
    content: '建议提前2-4周预订机票和酒店，可节省20%-30%的费用。关注航司会员日和酒店促销活动。',
    priority: 1
  },
  {
    id: 'T02',
    category: '交通出行',
    icon: '🚗',
    title: '租车 vs 打车',
    content: '家庭出行推荐租车，日均约200元起；2人以内建议打车或网约车，比租车更划算。',
    priority: 2
  },
  {
    id: 'T03',
    category: '住宿选择',
    icon: '🏨',
    title: '住宿地段建议',
    content: '选择交通便利的市区或景区附近住宿，节省通勤时间。多看住客评价，重点关注"位置"和"卫生"评分。',
    priority: 3
  },
  {
    id: 'T04',
    category: '美食推荐',
    icon: '🍜',
    title: '避开景区餐饮',
    content: '景区内餐饮通常溢价30%-50%，步行10分钟到居民区就能找到更地道实惠的美食。',
    priority: 4
  },
  {
    id: 'T05',
    category: '安全提醒',
    icon: '🔒',
    title: '旅行保险建议',
    content: '国内出行建议购买旅游意外险（10元/天起），包含医疗、财产损失等保障，花小钱买安心。',
    priority: 5
  }
]

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  switch (action) {
    case 'searchDestinations': {
      const { keyword, tag } = event
      let results = destinations
      if (keyword) {
        const kw = keyword.toLowerCase()
        results = results.filter(d =>
          d.name.includes(kw) ||
          d.nameEn.toLowerCase().includes(kw) ||
          d.tags.some(t => t.includes(kw)) ||
          d.description.includes(kw)
        )
      }
      if (tag) {
        results = results.filter(d => d.tags.includes(tag))
      }
      return { code: 0, data: results }
    }

    case 'getWeatherInfo': {
      const { destId } = event
      if (!destId) {
        return { code: -1, msg: '缺少目的地ID' }
      }
      const weather = weatherData[destId]
      if (!weather) {
        return { code: -1, msg: '未找到该目的地的天气信息' }
      }
      return { code: 0, data: weather }
    }

    case 'planTrip': {
      const { destId, departureDate, returnDate, budget, transport, hotel } = event
      if (!destId || !departureDate || !returnDate) {
        return { code: -1, msg: '参数不完整' }
      }
      const dest = destinations.find(d => d.destId === destId)
      if (!dest) {
        return { code: -1, msg: '目的地不存在' }
      }
      const planId = 'TP' + Date.now()
      const plan = {
        planId,
        destination: dest.name,
        departureDate,
        returnDate,
        budget: budget || 0,
        transport: transport || null,
        hotel: hotel || null,
        status: 'planned',
        openid,
        createdAt: new Date()
      }
      await db.collection('travel_plans').add({ data: plan })
      return { code: 0, data: { planId, status: 'planned', destination: dest.name } }
    }

    case 'getTravelTips': {
      const { category } = event
      let tips = travelTips
      if (category) {
        tips = tips.filter(t => t.category === category)
      }
      return { code: 0, data: tips }
    }

    default:
      return { code: -1, msg: `未知 action: ${action}` }
  }
}
