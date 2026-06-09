# payment-skill

微信支付集成 Skill，提供统一的支付能力，供其他 Skill 调用。

## 用户输入示例

- "我要付款"
- "确认支付"
- "支付订单"
- "查一下支付结果"
- "支付失败了帮我看看"

## 设计

详细设计文档见 [SKILL.md](SKILL.md)。

### 核心流程

```
业务 Skill（下单完成）
       ↓
createPayment({ orderId, totalAmount, description })
       ↓
wx.requestPayment(支付参数)
       ↓
queryPayment({ orderId }) → 确认支付状态
```

### 架构

- **预览模式**：mock 生成 prepay_id，不调用微信支付 API
- **正式模式**：云函数调微信支付 JSAPI 下单，返回真实 prepay_id

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `createPayment` | 创建支付订单，返回调起支付参数（prepay_id + 签名） |
| `queryPayment` | 查询订单支付状态 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/payment-card/index` | 支付状态卡片，自动调起 wx.requestPayment 并展示结果 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `payment-skill-handler` |
| 数据库集合 | `payment_records` |
