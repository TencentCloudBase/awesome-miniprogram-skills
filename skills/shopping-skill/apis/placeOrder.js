// 下单购买
// 规范（最佳实践）：
// - 使用模拟下单（环境不支持真实支付）
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解（不含 imageUrl）
// - _meta：组件渲染用（含 imageUrl），Agent 不可见
const { isPreviewMode, findProduct, findStore, saveOrder, getOpenid } = require('../utils/storage.js')
const { genOrderId } = require('../utils/id.js')

async function placeOrder({ productId, storeId } = {}) {
  try {
    if (!productId || !storeId) {
      return {
        isError: true,
        content: [{ type: 'text', text: '缺少 productId 或 storeId。禁止编造，应先调用 getProductDetail 获取有效 ID。' }]
      }
    }

    const product = findProduct(productId)
    if (!product) {
      return {
        isError: true,
        content: [{ type: 'text', text: `未找到 productId=${productId} 的商品。禁止编造 ID 再次调用。正确出口：引导用户重新搜索商品。` }]
      }
    }

    const store = findStore(storeId)
    if (!store) {
      return {
        isError: true,
        content: [{ type: 'text', text: `未找到 storeId=${storeId} 的门店。禁止编造 ID。` }]
      }
    }

    // 检查库存
    const storeStock = (product.storeStocks || []).find(s => s.storeId === Number(storeId))
    if (storeStock && storeStock.stock <= 0) {
      return {
        isError: true,
        content: [{ type: 'text', text: `「${product.name}」在 ${store.name} 已售罄。请引导用户选择其他门店或商品。` }]
      }
    }

    // 预览模式：走本地 storage
    if (isPreviewMode()) {
      const orderId = genOrderId()
      const order = {
        orderId,
        productId: product.id,
        productName: product.name,
        totalPrice: product.price,
        storeId: store.id,
        storeName: store.name,
        orderTime: new Date().toISOString(),
        status: 'paid'
      }
      saveOrder(order)

      return {
        isError: false,
        content: [{
          type: 'text',
          text: `下单成功！订单 ${orderId}，${product.name} 在 ${store.name} 已购买成功（¥${product.price}）。接下来为用户展示下单成功卡片，并简短告知"已下单成功，可前往门店取货"。禁止以纯文本重复订单详情。`
        }],
        structuredContent: {
          orderId: order.orderId,
          productName: order.productName,
          totalPrice: order.totalPrice,
          storeName: order.storeName,
          orderTime: order.orderTime,
          status: 'paid'
        },
        _meta: {
          imageUrl: product.imageUrl,
          address: store.address
        }
      }
    }

    // 正式模式：调云函数
    const { result } = await wx.cloud.callFunction({
      name: 'shopping-skill-handler',
      data: {
        action: 'placeOrder',
        openid: getOpenid(),
        productId: product.id,
        productName: product.name,
        totalPrice: product.price,
        storeId: store.id,
        storeName: store.name
      }
    })

    if (result && result.code === 0) {
      const order = result.data
      return {
        isError: false,
        content: [{
          type: 'text',
          text: `下单成功！订单 ${order.orderId}，${order.productName} 在 ${order.storeName} 已购买成功（¥${order.totalPrice}）。接下来为用户展示下单成功卡片，并简短告知"已下单成功，可前往门店取货"。禁止以纯文本重复订单详情。`
        }],
        structuredContent: {
          orderId: order.orderId,
          productName: order.productName,
          totalPrice: order.totalPrice,
          storeName: order.storeName,
          orderTime: order.orderTime,
          status: 'paid'
        },
        _meta: {
          imageUrl: product.imageUrl,
          address: store.address
        }
      }
    }

    return {
      isError: true,
      content: [{ type: 'text', text: result?.message || '下单失败' }]
    }
  } catch (err) {
    console.error('[shopping-skill][placeOrder] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `下单失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = placeOrder
