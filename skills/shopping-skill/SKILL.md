---
name: shopping-skill
description: 潮玩购物：商品搜索、详情、门店库存、下单
version: "1.0.0"
tags: ["微信小程序", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# shopping-skill 潮玩购物场景

## 业务流程图

```
用户意图
  │
  ├─ 模糊意图（"想逛逛/看看有什么潮玩"）─→ searchProducts(keyword='') → 推荐列表卡片
  │                                                                         │
  ├─ 明确关键词（"Molly/SP/盲盒/手办"）─→ searchProducts(keyword) → 搜索结果卡片 ─┤
  │                                                                             │
  │                           用户点击卡片选择某款商品                            │
  │                                    ↓                                        │
  │                             getProductDetail → 商品详情卡片                   │
  │                                    │                                        │
  │                    ┌───────────────┴───────────────┐                        │
  │                    ↓                               ↓                        │
  │         用户点击"查看门店库存"            用户点击"立即购买"                   │
  │                    ↓                               ↓                        │
  │          checkStoreStock → 库存卡片        placeOrder → 下单成功卡片          │
  │                                                                             │
  └─ 查询门店库存（"XX在哪有货"）──→ checkStoreStock → 门店库存卡片
```

> **Agent 不能跳过 getProductDetail 直接调 placeOrder**——必须先有 getProductDetail 返回的有效 productId。
> **Agent 不能编造 productId 或 storeId**——必须来自上游接口返回的原值。
> **placeOrder 未返回成功前，禁止向用户宣布"已下单成功"。**

## 原子接口依赖关系

| 接口 | 作用 | 组件 | 前置条件 |
|------|------|------|----------|
| searchProducts | 搜索/推荐潮玩商品 | product-list-card | — |
| getProductDetail | 查看商品详情 | product-detail-card | 已有 productId（来自 searchProducts） |
| checkStoreStock | 查询门店库存 | stock-check-card | 已有 productId（来自 getProductDetail） |
| placeOrder | 下单购买 | order-success-card | 已有 productId + storeId（来自 getProductDetail/checkStoreStock） |

## 业务约束（跨接口铁律）

### 1. 输出形态
- 所有成功返回的接口（isError=false）且绑定了组件的，**必须展示卡片**，禁止以纯文本列出卡片中的详情数据。
- Agent 回复时可附加一句简短引导话术（如"为你推荐了这些潮玩，点击卡片查看详情"），但**禁止把商品名、价格等以 markdown 列表形式展开**。

### 2. 执行顺序
- `placeOrder` 必须在调用成功（isError=false）后才能向用户宣布"下单成功"。
- `placeOrder` 必须在 `getProductDetail` 成功后调用。
- 禁止并发调用 `placeOrder`；须等上一笔结束后再发起下一笔。

### 3. 数据来源
- `productId` 必须来自 `searchProducts` / `getProductDetail` 返回的 `items[].productId` 或 `productId` 原值，禁止编造。
- `storeId` 必须来自 `checkStoreStock` / `getProductDetail` 返回的 `stores[].storeId` 原值，禁止编造。

### 4. 库存查询
- `checkStoreStock` 在没有指定 storeId 时返回所有门店的库存情况。
- 库存数据为模拟数据，实际库存以门店为准。

## 用户意图分流

### 直接意图（触发本 SKILL）
- "想逛逛潮玩"
- "有什么盲盒推荐"
- "看看手办"
- "Molly 有什么新款"
- "SP 限量款"
- "XX 在哪有货"
- "帮我下单这个"
- "买一个"
- "推荐潮玩"
- "最近有什么新品"

### 意图分流规则
- 用户只说"想逛/推荐"等模糊表达 → `searchProducts(keyword='')`
- 用户说出具体品名/品类/品牌 → `searchProducts(keyword='用户说的关键词')`
- 用户从卡片点击选中某商品 → `getProductDetail`（productId 由卡片 sendFollowUpMessage 传入）
- 用户问门店/库存 → `checkStoreStock`
- 用户要购买 → `placeOrder`（需先有 productId 和 storeId）
- 用户表达歧义短语（如"那个"）→ 先反问澄清，禁止猜测
