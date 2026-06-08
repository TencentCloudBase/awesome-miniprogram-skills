// 潮玩商品数据 seed（潮玩购物场景）
// 模拟泡泡玛特/得物风格的潮玩商品数据

const PRODUCTS = [
  // ---- 盲盒 ----
  {
    id: 1001,
    name: 'Molly 校园系列 盲盒',
    price: 59,
    categoryName: '盲盒',
    description: 'Molly 校园主题盲盒，含 12 款常规款 + 1 款隐藏款',
    imageUrl: 'https://via.placeholder.com/400x400/FF2D78/FFFFFF?text=Molly',
    tags: ['Molly', '校园系列', '盲盒', '热门'],
    storeStocks: [
      { storeId: 1, stock: 23 },
      { storeId: 2, stock: 8 },
      { storeId: 3, stock: 15 }
    ]
  },
  {
    id: 1002,
    name: 'SKULLPANDA 漫相集 盲盒',
    price: 69,
    categoryName: '盲盒',
    description: 'SKULLPANDA 艺术主题盲盒，每款都有独特艺术风格',
    imageUrl: 'https://via.placeholder.com/400x400/7928CA/FFFFFF?text=SP',
    tags: ['SKULLPANDA', '漫相集', '盲盒', '艺术'],
    storeStocks: [
      { storeId: 1, stock: 12 },
      { storeId: 2, stock: 0 },
      { storeId: 3, stock: 20 }
    ]
  },
  {
    id: 1003,
    name: 'DIMOO 水族馆系列 盲盒',
    price: 59,
    categoryName: '盲盒',
    description: 'DIMOO 水族馆主题，探索海底世界的奇妙生物',
    imageUrl: 'https://via.placeholder.com/400x400/00D4FF/FFFFFF?text=DIMOO',
    tags: ['DIMOO', '水族馆', '盲盒', '海洋'],
    storeStocks: [
      { storeId: 1, stock: 30 },
      { storeId: 2, stock: 18 },
      { storeId: 3, stock: 5 }
    ]
  },
  {
    id: 1004,
    name: 'LABUBU 精灵森林 盲盒',
    price: 79,
    categoryName: '盲盒',
    description: 'LABUBU 精灵主题盲盒，神秘森林中的小精灵',
    imageUrl: 'https://via.placeholder.com/400x400/FF6B35/FFFFFF?text=LABUBU',
    tags: ['LABUBU', '精灵森林', '盲盒', '限定'],
    storeStocks: [
      { storeId: 1, stock: 6 },
      { storeId: 2, stock: 14 },
      { storeId: 3, stock: 0 }
    ]
  },
  // ---- 手办 ----
  {
    id: 2001,
    name: 'Molly 珍藏版 花精灵 手办',
    price: 199,
    categoryName: '手办',
    description: 'Molly 花精灵限定手办，高约 15cm，精美涂装',
    imageUrl: 'https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Molly+手办',
    tags: ['Molly', '花精灵', '手办', '限定', '珍藏'],
    storeStocks: [
      { storeId: 1, stock: 3 },
      { storeId: 2, stock: 0 },
      { storeId: 3, stock: 7 }
    ]
  },
  {
    id: 2002,
    name: 'SKULLPANDA 夜之城 手办',
    price: 259,
    categoryName: '手办',
    description: 'SKULLPANDA 夜之城系列手办，赛博朋克风格',
    imageUrl: 'https://via.placeholder.com/400x400/1A1A2E/FFFFFF?text=SP+手办',
    tags: ['SKULLPANDA', '夜之城', '手办', '赛博朋克'],
    storeStocks: [
      { storeId: 1, stock: 0 },
      { storeId: 2, stock: 5 },
      { storeId: 3, stock: 2 }
    ]
  },
  // ---- 周边 ----
  {
    id: 3001,
    name: 'Molly 帆布包 托特包',
    price: 89,
    categoryName: '周边',
    description: 'Molly 限定印花帆布包，大容量日常百搭',
    imageUrl: 'https://via.placeholder.com/400x400/FFF0F5/FF2D78?text=帆布包',
    tags: ['Molly', '周边', '帆布包', '限定'],
    storeStocks: [
      { storeId: 1, stock: 45 },
      { storeId: 2, stock: 30 },
      { storeId: 3, stock: 50 }
    ]
  },
  {
    id: 3002,
    name: 'DIMOO 钥匙扣 盲盒挂件',
    price: 39,
    categoryName: '周边',
    description: 'DIMOO 可爱造型钥匙扣，随机款式',
    imageUrl: 'https://via.placeholder.com/400x400/00BFA5/FFFFFF?text=钥匙扣',
    tags: ['DIMOO', '周边', '钥匙扣', '挂件'],
    storeStocks: [
      { storeId: 1, stock: 60 },
      { storeId: 2, stock: 42 },
      { storeId: 3, stock: 35 }
    ]
  }
]

const STORES = [
  { id: 1, name: '潮玩星球 万象城店', address: '深圳市南山区万象城 B1-12' },
  { id: 2, name: '潮玩星球 海岸城店', address: '深圳市南山区海岸城 3F-08' },
  { id: 3, name: '潮玩星球 壹方城店', address: '深圳市宝安区壹方城 L2-15' }
]

const ORDERS = [
  {
    orderId: 'ORD_20260101_001',
    productId: 1001,
    productName: 'Molly 校园系列 盲盒',
    totalPrice: 59,
    storeName: '潮玩星球 万象城店',
    storeId: 1,
    orderTime: '2026-01-01T10:30:00.000Z',
    status: 'paid'
  }
]

module.exports = {
  PRODUCTS,
  STORES,
  ORDERS
}
