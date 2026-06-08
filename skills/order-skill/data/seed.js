// skills/order-skill/data/seed.js — mock 种子数据
const restaurants = [
  {
    restaurantId: 'R001',
    name: '麦香基·望京店',
    rating: 4.6,
    monthlySales: 3280,
    distance: '680m',
    deliveryFee: 3,
    estimatedMinutes: 25,
    tags: ['汉堡', '炸鸡', '快餐'],
    keywords: ['望京', '快餐', '汉堡'],
    minOrder: 20,
    status: 'open',
    menu: [
      { itemId: 'M001', name: '香辣鸡腿堡套餐', price: 32.9, image: 'https://picsum.photos/seed/m001/400/300', description: '香辣鸡腿堡+薯条+可乐', monthlySales: 1850 },
      { itemId: 'M002', name: '经典牛肉堡', price: 26.9, image: 'https://picsum.photos/seed/m002/400/300', description: '100%澳洲牛肉饼配新鲜蔬菜', monthlySales: 1220 },
      { itemId: 'M003', name: '脆皮炸鸡桶（6块）', price: 39.9, image: 'https://picsum.photos/seed/m003/400/300', description: '外酥里嫩，秘制腌料', monthlySales: 980 },
      { itemId: 'M004', name: '黄金薯条（大）', price: 12.9, image: 'https://picsum.photos/seed/m004/400/300', description: '现炸酥脆，撒上海盐', monthlySales: 2100 },
      { itemId: 'M005', name: '冰镇可乐（大）', price: 8.0, image: 'https://picsum.photos/seed/m005/400/300', description: '畅爽怡神', monthlySales: 2600 }
    ]
  },
  {
    restaurantId: 'R002',
    name: '川味轩·国贸店',
    rating: 4.8,
    monthlySales: 2150,
    distance: '1.2km',
    deliveryFee: 4,
    estimatedMinutes: 30,
    tags: ['川菜', '麻辣', '中餐'],
    keywords: ['国贸', '川菜', '麻辣', '中餐'],
    minOrder: 25,
    status: 'open',
    menu: [
      { itemId: 'M101', name: '水煮鱼', price: 58.0, image: 'https://picsum.photos/seed/m101/400/300', description: '活鱼现杀，麻辣鲜香', monthlySales: 760 },
      { itemId: 'M102', name: '麻婆豆腐', price: 22.0, image: 'https://picsum.photos/seed/m102/400/300', description: '正宗川味，入口即化', monthlySales: 1430 },
      { itemId: 'M103', name: '宫保鸡丁', price: 36.0, image: 'https://picsum.photos/seed/m103/400/300', description: '花生与鸡丁的经典搭配', monthlySales: 1150 },
      { itemId: 'M104', name: '酸辣土豆丝', price: 16.0, image: 'https://picsum.photos/seed/m104/400/300', description: '家常酸辣味', monthlySales: 980 },
      { itemId: 'M105', name: '米饭', price: 3.0, image: 'https://picsum.photos/seed/m105/400/300', description: '东北大米', monthlySales: 3000 }
    ]
  },
  {
    restaurantId: 'R003',
    name: '寿司之魂·三里屯店',
    rating: 4.7,
    monthlySales: 1680,
    distance: '2.0km',
    deliveryFee: 5,
    estimatedMinutes: 35,
    tags: ['日料', '寿司', '刺身'],
    keywords: ['三里屯', '日料', '寿司'],
    minOrder: 30,
    status: 'open',
    menu: [
      { itemId: 'M201', name: '三文鱼刺身（8片）', price: 68.0, image: 'https://picsum.photos/seed/m201/400/300', description: '挪威进口三文鱼，当日空运', monthlySales: 620 },
      { itemId: 'M202', name: '鳗鱼手握（2个）', price: 28.0, image: 'https://picsum.photos/seed/m202/400/300', description: '蒲烧鳗鱼配醋饭', monthlySales: 880 },
      { itemId: 'M203', name: '加州卷（8个）', price: 42.0, image: 'https://picsum.photos/seed/m203/400/300', description: '蟹棒+牛油果+黄瓜', monthlySales: 750 },
      { itemId: 'M204', name: '味噌汤', price: 12.0, image: 'https://picsum.photos/seed/m204/400/300', description: '日式传统味噌', monthlySales: 1100 }
    ]
  },
  {
    restaurantId: 'R004',
    name: '兰州拉面·中关村店',
    rating: 4.5,
    monthlySales: 4520,
    distance: '350m',
    deliveryFee: 2,
    estimatedMinutes: 20,
    tags: ['面食', '西北', '中餐'],
    keywords: ['中关村', '拉面', '面食'],
    minOrder: 15,
    status: 'open',
    menu: [
      { itemId: 'M301', name: '招牌牛肉拉面', price: 22.0, image: 'https://picsum.photos/seed/m301/400/300', description: '手工拉面，牛骨浓汤', monthlySales: 3200 },
      { itemId: 'M302', name: '牛肉板面', price: 24.0, image: 'https://picsum.photos/seed/m302/400/300', description: '宽面配卤牛肉', monthlySales: 1450 },
      { itemId: 'M303', name: '凉皮', price: 12.0, image: 'https://picsum.photos/seed/m303/400/300', description: '陕西风味凉皮', monthlySales: 980 },
      { itemId: 'M304', name: '肉夹馍', price: 10.0, image: 'https://picsum.photos/seed/m304/400/300', description: '腊汁肉夹白吉馍', monthlySales: 2100 },
      { itemId: 'M305', name: '酸梅汤', price: 6.0, image: 'https://picsum.photos/seed/m305/400/300', description: '冰镇解暑', monthlySales: 1800 },
      { itemId: 'M306', name: '卤蛋', price: 2.0, image: 'https://picsum.photos/seed/m306/400/300', description: '五香卤蛋', monthlySales: 2500 }
    ]
  },
  {
    restaurantId: 'R005',
    name: '必胜乐·五道口店',
    rating: 4.4,
    monthlySales: 2860,
    distance: '800m',
    deliveryFee: 3,
    estimatedMinutes: 28,
    tags: ['披萨', '西餐', '意面'],
    keywords: ['五道口', '披萨', '西餐'],
    minOrder: 28,
    status: 'open',
    menu: [
      { itemId: 'M401', name: '超级至尊披萨（9寸）', price: 59.0, image: 'https://picsum.photos/seed/m401/400/300', description: '培根+香肠+青椒+蘑菇', monthlySales: 920 },
      { itemId: 'M402', name: '奶油蘑菇意面', price: 36.0, image: 'https://picsum.photos/seed/m402/400/300', description: '浓郁奶油酱汁', monthlySales: 680 },
      { itemId: 'M403', name: 'BBQ烤鸡翅（6只）', price: 28.0, image: 'https://picsum.photos/seed/m403/400/300', description: '秘制BBQ酱烤制', monthlySales: 1100 },
      { itemId: 'M404', name: '凯撒沙拉', price: 22.0, image: 'https://picsum.photos/seed/m404/400/300', description: '新鲜罗马生菜配凯撒酱', monthlySales: 450 },
      { itemId: 'M405', name: '柠檬红茶', price: 10.0, image: 'https://picsum.photos/seed/m405/400/300', description: '冰爽柠檬红茶', monthlySales: 1500 }
    ]
  },
  {
    restaurantId: 'R006',
    name: '粥公粥婆·西二旗店',
    rating: 4.3,
    monthlySales: 1980,
    distance: '1.5km',
    deliveryFee: 2,
    estimatedMinutes: 22,
    tags: ['粥', '早餐', '养生'],
    keywords: ['西二旗', '粥', '早餐'],
    minOrder: 10,
    status: 'open',
    menu: [
      { itemId: 'M501', name: '皮蛋瘦肉粥', price: 15.0, image: 'https://picsum.photos/seed/m501/400/300', description: '慢火熬制，绵密鲜香', monthlySales: 1600 },
      { itemId: 'M502', name: '鲜虾粥', price: 28.0, image: 'https://picsum.photos/seed/m502/400/300', description: '鲜活大虾现煮', monthlySales: 780 },
      { itemId: 'M503', name: '小笼包（8只）', price: 18.0, image: 'https://picsum.photos/seed/m503/400/300', description: '鲜肉小笼，汤汁饱满', monthlySales: 1200 },
      { itemId: 'M504', name: '油条', price: 3.0, image: 'https://picsum.photos/seed/m504/400/300', description: '现炸酥脆', monthlySales: 2200 },
      { itemId: 'M505', name: '豆浆', price: 5.0, image: 'https://picsum.photos/seed/m505/400/300', description: '现磨浓豆浆', monthlySales: 1800 }
    ]
  },
  {
    restaurantId: 'R007',
    name: '沙县小吃·知春路店',
    rating: 4.2,
    monthlySales: 3650,
    distance: '200m',
    deliveryFee: 1,
    estimatedMinutes: 15,
    tags: ['小吃', '简餐', '中式'],
    keywords: ['知春路', '小吃', '简餐'],
    minOrder: 8,
    status: 'open',
    menu: [
      { itemId: 'M601', name: '蒸饺（10只）', price: 10.0, image: 'https://picsum.photos/seed/m601/400/300', description: '手工现包蒸饺', monthlySales: 2800 },
      { itemId: 'M602', name: '鸡腿饭', price: 16.0, image: 'https://picsum.photos/seed/m602/400/300', description: '卤鸡腿+时蔬+米饭', monthlySales: 2100 },
      { itemId: 'M603', name: '扁肉（小份）', price: 8.0, image: 'https://picsum.photos/seed/m603/400/300', description: '沙县特色扁肉', monthlySales: 1800 },
      { itemId: 'M604', name: '拌面', price: 6.0, image: 'https://picsum.photos/seed/m604/400/300', description: '花生酱拌面', monthlySales: 3200 },
      { itemId: 'M605', name: '炖罐（排骨）', price: 12.0, image: 'https://picsum.photos/seed/m605/400/300', description: '隔水炖排骨汤', monthlySales: 950 }
    ]
  }
]

const orders = [
  {
    orderId: 'OD20250101001',
    restaurantId: 'R001',
    restaurantName: '麦香基·望京店',
    items: [
      { itemId: 'M001', name: '香辣鸡腿堡套餐', price: 32.9, quantity: 1 },
      { itemId: 'M004', name: '黄金薯条（大）', price: 12.9, quantity: 1 }
    ],
    totalAmount: 45.8,
    deliveryFee: 3,
    deliveryAddress: '北京市朝阳区望京SOHO T2 15层',
    contactPhone: '138****1234',
    status: 'delivering',
    statusText: '配送中',
    riderName: '张师傅',
    riderPhone: '139****5678',
    estimatedArrival: '约15分钟后送达',
    orderTime: '2026-06-08 11:32',
    deliveryNote: ''
  },
  {
    orderId: 'OD20250101002',
    restaurantId: 'R004',
    restaurantName: '兰州拉面·中关村店',
    items: [
      { itemId: 'M301', name: '招牌牛肉拉面', price: 22.0, quantity: 2 },
      { itemId: 'M304', name: '肉夹馍', price: 10.0, quantity: 1 }
    ],
    totalAmount: 54.0,
    deliveryFee: 2,
    deliveryAddress: '北京市海淀区中关村大街1号',
    contactPhone: '138****5678',
    status: 'pending',
    statusText: '商家接单中',
    riderName: '',
    riderPhone: '',
    estimatedArrival: '约20分钟',
    orderTime: '2026-06-08 12:05',
    deliveryNote: '不要辣'
  },
  {
    orderId: 'OD20250101003',
    restaurantId: 'R007',
    restaurantName: '沙县小吃·知春路店',
    items: [
      { itemId: 'M601', name: '蒸饺（10只）', price: 10.0, quantity: 1 },
      { itemId: 'M603', name: '扁肉（小份）', price: 8.0, quantity: 1 },
      { itemId: 'M604', name: '拌面', price: 6.0, quantity: 1 }
    ],
    totalAmount: 24.0,
    deliveryFee: 1,
    deliveryAddress: '北京市海淀区知春路113号',
    contactPhone: '138****9012',
    status: 'completed',
    statusText: '已送达',
    riderName: '李师傅',
    riderPhone: '139****0000',
    estimatedArrival: '已送达',
    orderTime: '2026-06-08 08:15',
    deliveryNote: ''
  }
]

module.exports = { restaurants, orders }
