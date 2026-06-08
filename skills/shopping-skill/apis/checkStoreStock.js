// 查询门店库存
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（精简）
// - _meta：组件渲染用（含门店地址），Agent 不可见
const { findProduct, getStores } = require('../utils/storage.js')

async function checkStoreStock({ productId, storeId } = {}) {
  try {
    if (!productId) {
      return {
        isError: true,
        content: [{ type: 'text', text: '缺少 productId。禁止编造，应先调用 getProductDetail 获取有效 productId。' }]
      }
    }

    const product = findProduct(productId)
    if (!product) {
      return {
        isError: true,
        content: [{ type: 'text', text: `未找到 productId=${productId} 的商品。禁止编造 ID。` }]
      }
    }

    const allStores = getStores()
    let stocks = (product.storeStocks || []).map(s => {
      const store = allStores.find(st => st.id === s.storeId)
      return {
        storeId: s.storeId,
        storeName: store ? store.name : `门店${s.storeId}`,
        address: store ? store.address : '',
        stock: s.stock
      }
    })

    if (storeId) {
      stocks = stocks.filter(s => s.storeId === Number(storeId))
    }

    return {
      isError: false,
      content: [{
        type: 'text',
        text: `已查到「${product.name}」${storeId ? '指定门店' : '各门店'}的库存情况。接下来为用户展示门店库存卡片，用简短话术引导用户查看，禁止以纯文本列出库存详情。`
      }],
      structuredContent: {
        productId: product.id,
        productName: product.name,
        stores: stocks.map(s => ({
          storeId: s.storeId,
          storeName: s.storeName,
          stock: s.stock
        }))
      },
      _meta: {
        imageUrl: product.imageUrl,
        stores: stocks
      }
    }
  } catch (err) {
    console.error('[shopping-skill][checkStoreStock] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `查询库存失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = checkStoreStock
