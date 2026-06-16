---
name: payment-skill
description: 微信支付集成 Skill：下单支付、查询订单、关闭订单、申请退款、查询退款、商家转账、查询转账
version: "2.0.0"
tags: ["微信小程序", "支付", "微信支付", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# payment-skill 微信支付场景

## 业务流程图

```
用户意图
  │
  ├─ 下单支付（"帮我付款"）──→ createOrder → 支付订单卡片
  │                                │
  │                       用户点击"确认支付"
  │                                ↓
  │                       调用 wx.requestPayment
  │                                ↓
  │                          支付成功/失败
  │
  ├─ 查询订单（"查一下订单"）──→ queryOrder → 订单状态卡片
  │
  ├─ 关闭订单（"取消这个订单"）─→ closeOrder → 订单状态卡片（已关闭）
  │
  ├─ 申请退款（"我要退款"）───→ refundOrder → 退款结果卡片
  │
  ├─ 查询退款（"退款进度"）───→ queryRefund → 退款状态卡片
  │
  ├─ 商家转账（"转账给我"）───→ transferMoney → 转账结果卡片
  │
  └─ 查询转账（"转账到了吗"）──→ queryTransfer → 转账状态卡片
```

> **createOrder 必须在支付前调用**——先获取支付参数才能调起微信支付。
> **refundOrder 必须在订单支付成功后调用**——未支付的订单无法退款。
> **closeOrder 仅适用于未支付的订单**——已支付订单无法关闭，需走退款流程。

## 原子接口依赖关系

| 接口 | 作用 | 组件 | 前置条件 |
|------|------|------|----------|
| createOrder | 创建支付订单并调起支付 | payment-card | 用户明确表达支付意图 |
| queryOrder | 查询订单状态 | order-status-card | 已有 outTradeNo |
| closeOrder | 关闭未支付订单 | order-status-card | 订单状态为 NOTPAY |
| refundOrder | 申请退款 | refund-card | 订单状态为 SUCCESS |
| queryRefund | 查询退款进度 | refund-card | 已有 outRefundNo |
| transferMoney | 发起商家转账 | transfer-card | 用户确认转账 |
| queryTransfer | 查询转账状态 | transfer-card | 已有 outBillNo |

## 业务约束（跨接口铁律）

### 1. 输出形态
- 所有成功返回的接口（isError=false）且绑定了组件的，**必须展示卡片**，禁止以纯文本列出卡片中的详情数据。
- Agent 回复时可附加一句简短引导话术，但**禁止把订单号、金额、状态等以 markdown 列表形式展开**。

### 2. 执行顺序
- `refundOrder` 必须在 `queryOrder` 确认订单为 SUCCESS 状态后调用。
- `closeOrder` 必须在 `queryOrder` 确认订单为 NOTPAY 状态后调用。
- 禁止并发调用支付接口；须等上一笔结束后再发起下一笔。

### 3. 数据来源
- `outTradeNo` 必须来自 `createOrder` 返回的 `outTradeNo` 原值，禁止编造。
- `outRefundNo` 必须来自 `refundOrder` 返回的 `outRefundNo` 原值，禁止编造。
- `outBillNo` 必须来自 `transferMoney` 返回的 `outBillNo` 原值，禁止编造。

### 4. 金额处理
- 所有金额单位为**分**（如 1 元 = 100 分）。
- 禁止使用前端传入的金额直接下单，生产环境应从后端查询。
- 退款金额不能超过订单总金额。

### 5. 安全约束
- 后端通过 `wx.cloud.callHTTPFunction` 调用，平台自动鉴权。
- `payer.openid` 由后端从 `x-wx-openid` header 自动获取，前端无需传递。
- 禁止在前端硬编码任何密钥或证书信息。

## 用户意图分流

### 直接意图（触发本 SKILL）
- "帮我付款"
- "我要支付"
- "买单"
- "查一下订单状态"
- "这个订单还没付吧"
- "取消订单"
- "关闭这个订单"
- "我要退款"
- "申请退货退款"
- "退款到哪了"
- "转账给我"
- "发红包"

### 意图分流规则
- 用户说出"付款/支付/买单" → `createOrder`
- 用户问"订单状态/查单" → `queryOrder`
- 用户说"取消/关闭订单" → `closeOrder`（先查单确认 NOTPAY）
- 用户说"退款/退钱" → `refundOrder`（先查单确认 SUCCESS）
- 用户问"退款进度/到账了吗" → `queryRefund`
- 用户说"转账/打款" → `transferMoney`
- 用户问"转账状态" → `queryTransfer`
- 用户表达歧义 → 先反问澄清，禁止猜测
