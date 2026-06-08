// 搜索/推荐潮玩商品
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式 + 禁止纯文本列详情
// - structuredContent：供 Agent 理解（精简）
// - _meta：组件渲染用（含 imageUrl），Agent 不可见
// - 失败分支：堵死错误退路 + 给出正确出口
const { getProducts } = require('../utils/storage.js')

async function searchProducts({ keyword } = {}) {
  try {
    const kw = (keyword || '').trim().toLowerCase()
    const catalog = getProducts()

    let matched = catalog
    if (kw) {
      matched = catalog.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.categoryName.toLowerCase().includes(kw) ||
        (p.tags || []).some(t => t.toLowerCase().includes(kw)) ||
        (p.description || '').toLowerCase().includes(kw)
      )
    }

    if (!matched.length) {
      // 失败分支：事实陈述 + 禁止错误路径 + 给出正确出口
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `未在商品库中匹配到包含「${keyword}」的潮玩商品。禁止编造商品名再次调用本接口，禁止使用空关键词兜底搜索。正确出口：引导用户换个关键词（如 Molly、盲盒、手办），或直接展示推荐商品。`
        }]
      }
    }

    const picked = matched.slice(0, 3)

    // structuredContent：Agent 理解（精简，不含图片）
    const items = picked.map(p => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      categoryName: p.categoryName,
      description: p.description
    }))

    // _meta：组件渲染（含 imageUrl）
    const viewItems = picked.map(p => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      categoryName: p.categoryName,
      description: p.description,
      imageUrl: p.imageUrl
    }))

    const title = kw ? `"${keyword}" 搜索结果` : '精选推荐'

    return {
      isError: false,
      // content：事实陈述 + 业务动作 + 禁止纯文本
      content: [{
        type: 'text',
        text: `已${kw ? `搜索到 ${matched.length} 款匹配「${keyword}」的潮玩` : '为你精选潮玩好物'}。接下来为用户展示商品列表卡片，用简短话术引导用户从卡片中选择，禁止以纯文本列出商品详情。`
      }],
      structuredContent: {
        items,
        total: matched.length,
        hasMore: matched.length > picked.length,
        keyword: kw
      },
      _meta: {
        viewItems,
        title
      }
    }
  } catch (err) {
    console.error('[shopping-skill][searchProducts] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `搜索失败：${err.message || '未知错误'}。请引导用户稍后重试。` }]
    }
  }
}

module.exports = searchProducts
