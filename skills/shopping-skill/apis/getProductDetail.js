// 查看商品详情
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（不含 imageUrl 等纯渲染字段）
// - _meta：组件渲染用（含 imageUrl、tags、storeStocks），Agent 不可见
const { findProduct, getStores } = require('../utils/storage.js')

async function getProductDetail({ productId } = {}) {
  try {
    if (!productId) {
      return {
        isError: true,
        content: [{ type: 'text', text: '缺少 productId。禁止编造，应先调用 searchProducts 获取有效 productId。' }]
      }
    }

    const product = findProduct(productId)
    if (!product) {
      return {
        isError: true,
        content: [{ type: 'text', text: `未找到 productId=${productId} 的商品。禁止编造 ID 再次调用。正确出口：引导用户重新搜索商品。` }]
      }
    }

    const allStores = getStores()
    const storeInfo = (product.storeStocks || []).map(s => {
      const store = allStores.find(st => st.id === s.storeId)
      return {
        storeId: s.storeId,
        storeName: store ? store.name : `门店${s.storeId}`,
        stock: s.stock
      }
    })

    return {
      isError: false,
      content: [{
        type: 'text',
        text: `已查到「${product.name}」的详细信息（¥${product.price}）。接下来为用户展示商品详情卡片，卡片上可查看门店库存或直接购买，禁止以纯文本列出商品详情。`
      }],
      structuredContent: {
        productId: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        categoryName: product.categoryName,
        tags: product.tags || [],
        stores: storeInfo
      },
      _meta: {
        imageUrl: product.imageUrl,
        tags: product.tags || []
      }
    }
  } catch (err) {
    console.error('[shopping-skill][getProductDetail] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `查询失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = getProductDetail
