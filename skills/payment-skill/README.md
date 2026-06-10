# payment-skill

微信支付集成 Skill，提供完整的微信支付能力：创建支付订单、调起支付、查询支付状态。

## 用户输入示例

- "我要付款"
- "确认支付"
- "支付订单"
- "查一下支付结果"
- "支付失败了帮我看看"

## 架构

```
用户输入 → payment-skill
  → createPayment / queryPayment（预览模式 mock / 正式模式调用 pay-common）
  → payment-card 组件自动调起 wx.requestPayment
```

**正式模式数据流：**

```
createPayment → wx.request → pay-common（HTTP 云函数）
  → wechatpay-node-v3 SDK 签名
  → 调微信支付 V3 API（JSAPI 下单）
  → 返回真实 prepay_id + 签名参数
  → wx.requestPayment 弹窗 → 支付成功
  → queryPayment → wx.request → pay-common 查单 → 确认支付结果
```

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

| 资源 | 名称 | 说明 |
|------|------|------|
| HTTP 云函数 | `pay-common` | Express + 微信支付 V3 SDK，负责签名、下单、查单、回调 |
| 数据库集合 | `payment_records` | 持久化支付记录（幂等、对账用） |

## 部署与配置

### 1. 部署 pay-common 云函数

```bash
# 安装依赖
cd skills/payment-skill/cloudfunctions/pay-common
npm install

# 通过 CloudBase CLI 部署为 HTTP 云函数
tcb functions deploy pay-common --type HTTP
```

### 2. 配置环境变量

部署后在 CloudBase 控制台设置以下环境变量：

| 变量 | 必填 | 说明 |
|------|------|------|
| `appId` | ✅ | 小程序 AppID |
| `merchantId` | ✅ | 微信支付商户号 |
| `merchantSerialNumber` | ✅ | 商户 API 证书序列号 |
| `apiV3Key` | ✅ | API V3 密钥（32 字节） |
| `privateKey` | ✅ | 商户 API 证书私钥（PEM 格式） |
| `wxPayPublicKey` | ✅ | 微信支付公钥（PEM 格式） |
| `wxPayPublicKeyId` | ✅ | 微信支付公钥 ID |
| `signMode` | 否 | 默认 `sdk`；可选 `gateway`（集成中心模式） |
| `notifyURLPayURL` | 否 | 支付回调 URL，带回调路由路径 |
| `notifyURLRefundsURL` | 否 | 退款回调 URL |

**私钥格式说明：**

私钥中的换行符必须用字面 `\n`（两个字符）表示，不可用真换行：

```
# ❌ 错误
privateKey="-----BEGIN PRIVATE KEY-----\n
MIIEvQ...\n
-----END PRIVATE KEY-----"

# ✅ 正确
privateKey="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----"
```

### 3. 配置 HTTP 访问服务

部署后在 CloudBase 控制台开启 **HTTP 访问服务**，确保 `https://<env-id>.service.tcloudbase.com/wx-pay/...` 可访问。

### 4. 配置小程序域名白名单

在小程序后台 → 开发 → 开发设置 → 服务器域名 → **request 合法域名** 中添加：

```
https://<env-id>.service.tcloudbase.com
```

### 5. 切换正式模式

```javascript
// 关闭预览模式（开启正式模式）
wx.setStorageSync('mp_skills_preview_mode', false)
```

## 预览模式

默认走预览模式，不调用微信支付 API，适合开发调试：

```javascript
// 开启预览模式（默认）
wx.setStorageSync('mp_skills_preview_mode', true)
```
