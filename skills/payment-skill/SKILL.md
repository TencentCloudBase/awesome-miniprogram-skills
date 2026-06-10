---
name: payment-skill
description: 微信支付集成 Skill：创建支付订单、调起支付、查询支付状态
version: "1.0.0"
tags: ["微信小程序", "支付", "微信支付", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# payment-skill 微信支付集成

## 业务流程

```
业务方完成下单 → createPayment({ orderId, totalAmount, description })
       │
       ├─ 调云函数 payment-skill-handler
       │   ├─ 参数校验（金额单位转分）
       │   ├─ 调微信支付 JSAPI 下单 → 获取 prepay_id
       │   └─ 组装小程序调起支付参数
       │
       ↓
客户端 wx.requestPayment(支付参数)
       │
       ├─ 成功 → queryPayment 确认支付结果
       └─ 失败 → 返回错误
```

## 原子接口

### createPayment

创建支付订单，获取小程序调起支付的参数。

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | string | 是 | 业务方订单号 |
| totalAmount | number | 是 | 订单金额，单位：元 |
| description | string | 是 | 订单描述，展示在支付弹窗中 |
| attach | string | 否 | 附加数据，回调时原样返回 |
| skillName | string | 是 | 调用方 Skill 名称，用于回调时区分业务 |

**返回值：**

```javascript
{
  isError: false,
  structuredContent: {
    orderId: "Oxxx",
    prepayId: "wx111111111111111",
    payParams: {
      timeStamp: "1717920000",
      nonceStr: "abc123",
      package: "prepay_id=wx111111111111111",
      signType: "RSA",
      paySign: "base64signature..."
    },
    totalAmount: 32.90
  },
  _meta: {
    payParams
  }
}
```

### queryPayment

查询支付结果。

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
| transactionId | string | 微信交易号 |
| status | string | pending / success / fail |
| createTime | date | 创建时间 |
| payTime | date | 支付时间 |

## 设计约束

1. **金额中台化**：金额统一以"元"为输入单位，云函数内转"分"调微信支付 API，返回时再转回"元"
2. **幂等**：同一 orderId 重复调用 createPayment 返回相同的 prepay_id，不重复下单
3. **回调安全**：支付结果以云函数查单为准，不以客户端返回为准
4. **业务隔离**：payment-skill 只负责支付，不感知业务方订单内容

