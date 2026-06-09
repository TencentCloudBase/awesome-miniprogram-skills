---
name: payment-skill
description: 微信支付集成 Skill：创建支付订单、调起支付、查询支付状态
version: "1.0.0"
tags: ["微信小程序", "支付", "微信支付", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# payment-skill 微信支付集成

## 设计目标

提供一个通用的微信支付 Skill，其他涉及支付的 Skill（drink-skill、order-skill、bill-skill、shopping-skill）通过它完成支付流程，避免每个 Skill 重复实现支付逻辑。

```
业务 Skill（下单）              payment-skill（支付）           云函数
                                                             
  placeOrder                      createPayment                payment-skill-handler
       │                              │                            │
       │  创建订单完成                  │  生成 prepay_id             │  调微信支付 API
       ├─────→ createPayment ─────────→│────────→ getPrepayId ────→│
       │                              │   返回 prepay_id           │
       │                              │←─────────────             │
       │  返回支付参数                  │                           
       │←──── { prepayId, ... } ─────│                           
       │                              │                           
  wx.requestPayment                   │                           
       │                              │                           
   支付结果 ──→ queryPayment ────────→│────────→ verifyPayment ──→│
                                      │   更新订单状态              │
                                      │←─────────────             │
```

## 业务流程

```
业务方 API 完成下单
       │
       ↓
createPayment({ orderId, totalAmount, description })
       │
       ├─ 预览模式：mock 生成 prepay_id
       └─ 正式模式：调云函数 payment-skill-handler
                       │
                       ├─ 参数校验（金额单位转分，必填字段检查）
                       ├─ 调微信支付 JSAPI 下单 → 获取 prepay_id
                       ├─ 组装小程序调起支付参数
                       └─ 返回 prepay_id + 支付参数
       │
       ↓
客户端 wx.requestPayment(支付参数)
       │
       ├─ 成功 → 调云函数确认支付成功
       └─ 失败 → 返回错误给用户
       │
       ↓
queryPayment({ orderId })
       ├─ 预览模式：返回 mock 支付状态
       └─ 正式模式：调微信支付查单 API
```

## 原子接口

### createPayment

创建支付订单，获取小程序调起支付的参数。

**调用前置条件：**
- 调用方 Skill 已完成下单流程，生成了业务订单号
- 清楚订单金额和描述信息
- 在当前小程序环境内（JSAPI 支付）

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | string | 是 | 业务方订单号（如 drink-skill 的 Oxxx） |
| totalAmount | number | 是 | 订单金额，单位：元（如 32.90） |
| description | string | 是 | 订单描述，展示在支付弹窗中 |
| attach | string | 否 | 附加数据，回调时原样返回，用于业务方识别 |
| skillName | string | 是 | 调用方 Skill 名称，用于回调时区分业务 |

**返回值：**

```javascript
{
  isError: false,
  structuredContent: {
    orderId: "Oxxx",
    prepayId: "wx111111111111111",
    payParams: {                   // wx.requestPayment 的入参
      timeStamp: "1717920000",
      nonceStr: "abc123",
      package: "prepay_id=wx111111111111111",
      signType: "RSA",
      paySign: "base64signature..."
    },
    totalAmount: 32.90
  },
  _meta: {
    payParams // 组件渲染用
  }
}
```

### queryPayment

查询支付结果。

**调用前置条件：** createPayment 已调用，用户已完成或取消支付。

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | string | 是 | 业务方订单号 |

**返回值：**

```javascript
{
  isError: false,
  structuredContent: {
    orderId: "Oxxx",
    status: "success",    // success / fail / pending
    payTime: "2026-06-09T10:30:00Z",
    transactionId: "wx420000000000000000000"
  }
}
```

## 原子组件

| 组件 | 说明 |
|------|------|
| `components/payment-card/index` | 支付状态卡片，展示支付进度和结果 |

组件行为：
1. 接收到 createPayment 返回结果后，自动调起 wx.requestPayment
2. 支付成功 → 自动调 queryPayment 确认 → 展示成功状态
3. 支付失败 → 展示失败状态，提供重试入口
4. 支付中 → 展示加载状态

## 原子接口依赖关系

| 接口 | 前置条件 | 后续接口 |
|------|---------|---------|
| createPayment | 业务方已完成下单 | 客户端调 wx.requestPayment → 组件自动调 queryPayment |
| queryPayment | createPayment 已调用 | 无 |

## 云函数

**云函数名：** `payment-skill-handler`

**支持的 action：**

| action | 说明 |
|--------|------|
| createPayment | 调微信支付 JSAPI 下单，返回 prepay_id 和支付参数 |
| queryPayment | 查单接口，返回支付状态 |

**数据库集合：** `payment_records`

| 字段 | 类型 | 说明 |
|------|------|------|
| openid | string | 用户标识 |
| orderId | string | 业务方订单号 |
| skillName | string | 调用方 Skill 名称 |
| totalAmount | number | 订单金额（分） |
| description | string | 订单描述 |
| prepayId | string | 微信 prepay_id |
| transactionId | string | 微信交易号（支付成功后） |
| status | string | pending / success / fail |
| createTime | date | 创建时间 |
| payTime | date | 支付时间 |

## 设计约束

1. **金额中台化**：金额统一以"元"为输入单位，云函数内转"分"调微信支付 API，返回时再转回"元"
2. **幂等**：同一 orderId 重复调用 createPayment 返回相同的 prepay_id，不重复下单
3. **回调安全**：支付结果以云函数查单为准，不以客户端返回为准
4. **预览降级**：预览模式直接 mock 成功，不调微信支付 API
5. **业务隔离**：payment-skill 只负责支付，不感知业务方订单内容

## 其他 Skill 集成方式

各 Skill 的支付 API 调用 payment-skill：

```javascript
// 业务方 API 中（如 drink-skill/apis/payOrder.js）
async function payOrder({ orderId, ... }) {
  // ... 校验订单 ...

  // 调 payment-skill 完成支付
  const { result } = await wx.modelContext.callAPI('payment-skill', 'createPayment', {
    orderId,
    totalAmount: order.totalPrice,
    description: `${order.drinkName} ${order.specText}`,
    skillName: 'drink-skill'
  })

  // 在预览模式下直接 mock 支付成功
  if (isPreviewMode() && result.prepayId === 'mock_prepay') {
    return successResult('支付成功', { ... })
  }

  // 正式模式：客户端调起支付
  return successResult('请确认支付', {
    orderId,
    payParams: result.payParams,
    status: 'pending'
  })
}
```

## 后续实现计划

1. 创建 SKILL.md（当前文件）
2. 实现 mcp.json 接口声明
3. 实现 utils/util.js（isPreviewMode 等）
4. 实现 apis/createPayment.js
5. 实现 apis/queryPayment.js
6. 实现 components/payment-card（调起 wx.requestPayment 的组件）
7. 实现 cloudfunctions/payment-skill-handler（调微信支付 API）
8. 实现 database/collections.json
9. 优化 drink-skill、bill-skill、order-skill、shopping-skill 的支付逻辑，改为调 payment-skill
10. 编写 README.md
11. 注册到 app.json
