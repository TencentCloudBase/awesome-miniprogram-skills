# payment-skill —— 微信支付 AI Skill

基于微信小程序 AI 模式（Agent）开发的支付场景 Skill，遵循 [小程序 AI 开发指南](https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html) 规范。

## 新用户先读

如果你是第一次接触小程序 AI 开发模式，可以先理解这几个概念：

- **小程序 AI 开发模式**：微信小程序提供的 AI Agent 能力，允许用户用自然语言发起任务，小程序通过原子接口和原子组件完成业务动作与结果展示。
- **Skill**：一个可被 AI 调用的业务能力包，通常包含 `SKILL.md`、`mcp.json`、原子接口、原子组件，以及可选的云函数和数据库配置。
- **mp-skills**：小程序 AI Skill 的 CLI 工具，用于查找、安装、接入、校验和部署 Skill。

更多背景和完整接入说明见 [CloudBase 小程序 AI 解决方案](https://docs.cloudbase.net/solutions/wechat-miniprogram-ai/)，以及 [CloudBase 文档](https://docs.cloudbase.net/)。

## 安装到自己的小程序

在你自己的小程序项目根目录执行：

```bash
cd your-miniprogram
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s payment-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

---

## 🚀 快速上手

> 只需 4 步，即可让你的 AI 小程序具备完整的微信支付能力。

### Step 1：配置 `cloudbaserc.json`

编辑 `skills/payment-skill/cloudbaserc.json`，填入你的实际凭证：

```json
{
  "envId": "你的云开发环境ID",
  "functions": [{
    "name": "pay-common",
    "envVariables": {
      "appId": "你的小程序AppID",
      "merchantId": "你的商户号",
      "merchantSerialNumber": "你的证书序列号",
      "apiV3Key": "你的APIv3密钥",
      "privateKey": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBA...\\n-----END PRIVATE KEY-----",
      "wxPayPublicKey": "-----BEGIN PUBLIC KEY-----\\nMIIBIjAN...\\n-----END PUBLIC KEY-----",
      "wxPayPublicKeyId": "你的微信支付公钥ID",
      "notifyURLPayURL": "https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/unifiedOrderTrigger",
      "notifyURLRefundsURL": "https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/refundTrigger",
      "transferNotifyUrl": "https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/transferTrigger"
    }
  }]
}
```

> ⚠️ **回调 URL 必须填写实际的完整地址**，不能使用模板变量。示例：
> ```
> "notifyURLPayURL": "https://test-wxpay-5gy4ugzreef15cfe.service.tcloudbase.com/pay-common/wx-pay/unifiedOrderTrigger"
> ```

### Step 2：配置 `config.js`

编辑 `skills/payment-skill/config.js`，填入与 `cloudbaserc.json` 一致的值：

```javascript
module.exports = {
  functionName: 'pay-common',                  // 与 cloudbaserc.json 中 functions[].name 一致
  envId: ''        // 与 cloudbaserc.json 中 envId 一致
}
```

### Step 3：一键部署

```bash
npx mp-skills setup
```

自动完成：合并配置 → 安装依赖 → 部署云函数 → 创建数据库集合。

### Step 4：关闭回调路由鉴权

在云开发控制台 → 云函数 → `pay-common` → HTTP 触发，将以下路径设为**免鉴权**：

- `/wx-pay/unifiedOrderTrigger`
- `/wx-pay/refundTrigger`
- `/wx-pay/transferTrigger`

✅ **部署完成！** 现在可以在 AI 对话中直接使用支付功能了。

---

## 📋 目录

- [前置条件](#前置条件)
- [后端配置详解](#后端配置详解)
- [小程序端配置](#小程序端配置)
- [功能列表](#功能列表)
- [目录结构](#目录结构)
- [使用示例](#使用示例)
- [常见问题](#常见问题)

---

## 前置条件

| 类别 | 要求 | 说明 |
|------|------|------|
| 商户号 | 微信支付商户号已开通 | [商户平台](https://pay.weixin.qq.com/) 注册 |
| 云开发 | 已开通云开发环境 | 微信公众平台 → 开发管理 → 云开发 |
| 基础库 | >= 3.7.7 | 支持 AI 模式 |
| app.json | 配置 `"cloud": true` + `agent` 字段 | 见[小程序端配置](#小程序端配置) |

---

## 后端配置详解

### 方式一：使用 mp-skills setup 一键部署（推荐 ✅）

这是推荐方式，`npx mp-skills setup` 自动处理云函数部署和数据库创建。

#### 1. 准备商户凭证

从 [微信支付商户平台](https://pay.weixin.qq.com/) 获取：

| 凭证 | 获取位置 | 格式 |
|------|----------|------|
| 商户号 (`merchantId`) | 商户平台首页 | 10 位数字 |
| 证书序列号 (`merchantSerialNumber`) | 账户中心 → API 安全 → API 证书 | 40 位十六进制 |
| APIv3 密钥 (`apiV3Key`) | 账户中心 → API 安全 → 设置 APIv3 密钥 | 32 字节字符串 |
| 商户私钥 (`privateKey`) | 申请证书时下载的 `apiclient_key.pem` | PEM 格式 |
| 微信支付公钥 (`wxPayPublicKey`) | 账户中心 → API 安全 → 微信支付公钥 | PEM 格式 |
| 公钥 ID (`wxPayPublicKeyId`) | 同上 | 与公钥配对 |

> ⚠️ **微信支付公钥 ≠ 商户 API 公钥**。务必使用「微信支付公钥」，不是申请证书时生成的商户公钥。

#### 2. 填写 cloudbaserc.json

编辑 `skills/payment-skill/cloudbaserc.json`，替换所有占位符为实际值：

```json
{
  "envId": "你的云开发环境ID",
  "functions": [{
    "name": "pay-common",
    "type": "http",
    "envVariables": {
      "signMode": "sdk",
      "appId": "你的小程序AppID",
      "merchantId": "你的商户号",
      "merchantSerialNumber": "你的证书序列号",
      "apiV3Key": "你的APIv3密钥",
      "privateKey": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBA...\\n-----END PRIVATE KEY-----",
      "wxPayPublicKey": "-----BEGIN PUBLIC KEY-----\\nMIIBIjAN...\\n-----END PUBLIC KEY-----",
      "wxPayPublicKeyId": "你的微信支付公钥ID",
      "notifyURLPayURL": "https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/unifiedOrderTrigger",
      "notifyURLRefundsURL": "https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/refundTrigger",
      "transferNotifyUrl": "https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/transferTrigger"
    }
  }]
}
```

**关于 privateKey**：将 PEM 文件换行替换为 `\n`（字面两个字符），写成一行。

**关于回调 URL**：必须填写部署后的实际完整地址。示例：

```
https://test-wxpay-5gy4ugzreef15cfe.service.tcloudbase.com/pay-common/wx-pay/unifiedOrderTrigger
https://test-wxpay-5gy4ugzreef15cfe.service.tcloudbase.com/pay-common/wx-pay/refundTrigger
https://test-wxpay-5gy4ugzreef15cfe.service.tcloudbase.com/pay-common/wx-pay/transferTrigger
```

> 格式规则：`https://<envId>.service.tcloudbase.com/<函数名>/wx-pay/<路由>`

#### 3. 运行部署

```bash
npx mp-skills setup
```

`mp-skills setup` 自动完成：

| 步骤 | 说明 |
|------|------|
| 合并配置 | Skill 级 `cloudbaserc.json` → 项目级 |
| 安装依赖 | `cloudfunctions/pay-common/` 的 npm 包 |
| 部署云函数 | 部署为 HTTP 云函数 |
| 创建数据库 | 自动创建 `payment_records`、`refund_records`、`transfer_records` 集合及索引 |

#### 4. 关闭回调路由鉴权

在云开发控制台 → 云函数 → `pay-common` → HTTP 触发，将以下 3 个回调路径设为**免鉴权**：

- `/wx-pay/unifiedOrderTrigger`（支付回调）
- `/wx-pay/refundTrigger`（退款回调）
- `/wx-pay/transferTrigger`（转账回调）

> 微信支付服务器直接调用回调路径，无法携带鉴权 token，必须免鉴权。安全由内部签名验证保证。

#### 5. 验证部署

```bash
# 返回错误信息即表示服务已启动（404 是正常的，说明 Express 在运行）
curl https://<envId>.service.tcloudbase.com/pay-common/
```

---

### 方式二：通过云开发集成中心配置

直接在腾讯云云开发控制台的「集成中心」完成微信支付的可视化配置：

**👉 [打开集成中心 - 微信支付配置](https://tcb.cloud.tencent.com/dev?envId=#/integration-center/create)**

> ⚠️ URL 中的 `envId` 需替换为你实际的云开发环境 ID

配置步骤：

1. 登录 [腾讯云云开发控制台](https://tcb.cloud.tencent.com/)
2. 选择你的云开发环境
3. 进入左侧菜单「集成中心」
4. 找到「微信支付」集成能力，点击创建
5. 按引导填写商户信息
6. 完成后系统自动部署支付相关云函数

---

## 小程序端配置

### 1. 注册 Skill

在 `app.json` 中添加：

```json
{
  "agent": {
    "skills": [{
      "name": "payment",
      "description": "微信支付场景：下单支付、查询订单、关闭订单、申请退款、查询退款、商家转账、查询转账",
      "path": "skills/payment-skill"
    }]
  }
}
```

### 2. 配置 config.js

打开 `skills/payment-skill/config.js`，填入你的云函数名称和环境 ID：

```javascript
module.exports = {
  functionName: 'pay-common',       // 云函数名称，须与 cloudbaserc.json 中 functions 的 name 一致
  envId: 'your-env-id'             // 云开发环境 ID，须与 cloudbaserc.json 中的 envId 一致
}
```

**配置说明：**

| 字段 | 必填 | 说明 | 示例 |
|------|:----:|------|------|
| `functionName` | ✅ | 部署的 HTTP 云函数名称，必须与 `cloudbaserc.json` 中 `functions[].name` 保持一致 | `'pay-common'` |
| `envId` | ✅ | 你的云开发环境 ID，必须与 `cloudbaserc.json` 中的 `envId` 保持一致 | `'test-wxpay-5gy4ugzreef15cfe'` |

> ⚠️ **注意**：小程序运行时无法读取 JSON 文件，所以 `config.js` 需要与 `cloudbaserc.json` 手动保持同步。如果你修改了 `cloudbaserc.json` 中的函数名或环境 ID，请同步更新此文件。

---

## 功能列表

| 功能 | 接口 | 用户说 | 效果 |
|------|------|--------|------|
| 🛒 下单支付 | `createOrder` | "帮我付 1 元" | 弹出微信支付弹窗 |
| 🔍 查询订单 | `queryOrder` | "查一下刚才的订单" | 展示订单状态卡片 |
| ❌ 关闭订单 | `closeOrder` | "取消这个订单" | 关闭未支付订单 |
| 💰 申请退款 | `refundOrder` | "我要退款" | 发起退款 |
| 📋 查询退款 | `queryRefund` | "退款到哪了" | 查询退款进度 |
| 💸 商家转账 | `transferMoney` | "转 5 块钱给我" | 发起转账 |
| 📊 查询转账 | `queryTransfer` | "钱到了吗" | 查询转账状态 |

---

## 目录结构

```
skills/payment-skill/
├── config.js               # ⭐ 用户配置文件（只需改这里）
├── cloudbaserc.json        # ⭐ 部署配置（凭证 + 环境变量）
├── index.js                # 入口（注册所有原子接口）
├── mcp.json                # MCP 协议声明
├── apis/                   # 原子接口
│   ├── createOrder.js      # 创建订单 + 调起支付
│   ├── queryOrder.js       # 查询订单
│   ├── closeOrder.js       # 关闭订单
│   ├── refundOrder.js      # 申请退款
│   ├── queryRefund.js      # 查询退款
│   ├── transferMoney.js    # 商家转账
│   └── queryTransfer.js    # 查询转账
├── components/             # UI 组件
│   ├── payment-card/       # 支付结果卡片
│   ├── order-status-card/  # 订单状态卡片
│   ├── refund-card/        # 退款结果卡片
│   └── transfer-card/      # 转账结果卡片
├── cloudfunctions/         # 后端云函数
│   └── pay-common/         # HTTP 云函数（微信支付 V3 服务）
│       ├── index.js        # 入口
│       ├── app.js          # Express 应用
│       ├── config/         # 配置管理
│       ├── routes/         # 路由定义
│       ├── controllers/    # 控制器
│       ├── services/       # 支付/订单服务
│       └── utils/          # 工具函数
└── utils/                  # 前端工具
    ├── util.js             # 云函数调用封装
    ├── id.js               # 单号生成
    └── storage.js          # 本地存储
```

---

## 环境变量参考

| 变量 | 必填 | 说明 |
|------|:----:|------|
| `signMode` | ✅ | `sdk`（自验签，推荐）或 `gateway`（集成中心代验签） |
| `appId` | ✅ | 小程序 AppID |
| `merchantId` | ✅ | 商户号（10 位数字） |
| `merchantSerialNumber` | ✅ | 证书序列号（40 位十六进制） |
| `apiV3Key` | ✅ | APIv3 密钥（32 字节） |
| `privateKey` | ✅ | 商户私钥（PEM，换行用 `\n`） |
| `wxPayPublicKey` | 推荐 | 微信支付公钥（配置后用公钥验签，更稳定） |
| `wxPayPublicKeyId` | 与上联动 | 配了 `wxPayPublicKey` 则必填 |
| `notifyURLPayURL` | ✅ | 支付回调 URL |
| `notifyURLRefundsURL` | ✅ | 退款回调 URL |
| `transferNotifyUrl` | ✅ | 转账回调 URL |

---

## signMode 说明

`signMode` 决定回调通知（微信支付→你的服务器）的处理方式。**主动请求（下单/退款等）两种模式均走 SDK 自签名。**

### `sdk` 模式（推荐 ✅）

适合独立部署场景，云函数自行完成回调验签 + 解密。

**验签方式**：
- 配置了 `wxPayPublicKey` → 公钥验签（推荐，无额外网络请求）
- 未配置 → 证书验签（SDK 自动下载平台证书）

**回调处理流程**：
```
微信支付 → POST 加密数据 → 你的云函数
  → 验签（RSA-SHA256）→ AES-256-GCM 解密 → 更新数据库 → 返回 200
```

### `gateway` 模式

适合已开通**云开发集成中心**的场景，集成中心代为验签和解密。

| 对比项 | `sdk` | `gateway` |
|--------|-------|-----------|
| 回调验签 | 云函数自行处理 | 集成中心代理 |
| 回调 URL | 指向你的云函数 | 指向集成中心域名 |
| 适用场景 | 独立部署 | 已开通集成中心 |

> ⚠️ 无论哪种模式，`merchantId`、`merchantSerialNumber`、`apiV3Key`、`privateKey` 都是必填的。

---

## 后端路由

`pay-common` 云函数提供以下 HTTP 路由（前缀 `/wx-pay`）：

**主动请求路由（需鉴权）：**

| 路由 | 说明 |
|------|------|
| `/wx-pay/wxpay_order` | 小程序下单（JSAPI） |
| `/wx-pay/wxpay_order_h5` | H5 下单 |
| `/wx-pay/wxpay_order_native` | Native 扫码下单 |
| `/wx-pay/wxpay_query_order_by_out_trade_no` | 商户订单号查询 |
| `/wx-pay/wxpay_query_order_by_transaction_id` | 微信订单号查询 |
| `/wx-pay/wxpay_close_order` | 关闭订单 |
| `/wx-pay/wxpay_refund` | 申请退款 |
| `/wx-pay/wxpay_refund_query` | 查询退款 |
| `/wx-pay/wxpay_transfer` | 发起转账 |
| `/wx-pay/wxpay_transfer_bill_query` | 商户单号查询转账 |
| `/wx-pay/wxpay_transfer_bill_query_by_no` | 微信单号查询转账 |

**回调路由（免鉴权）：**

| 路由 | 说明 |
|------|------|
| `/wx-pay/unifiedOrderTrigger` | 支付结果通知 |
| `/wx-pay/refundTrigger` | 退款结果通知 |
| `/wx-pay/transferTrigger` | 转账结果通知 |

---

## 自定义业务逻辑

`cloudfunctions/pay-common/services/orderService.js` 是业务钩子层。上线前替换为你的数据库操作：

| 方法 | 触发时机 | 你需要做什么 |
|------|---------|-------------|
| `handlerUnified` | 下单成功 | 创建订单记录 |
| `handlerUnifiedTrigger` | 支付回调 | 更新为"已支付"（幂等） |
| `handlerRefund` | 退款申请成功 | 更新为"退款中" |
| `handlerRefundTrigger` | 退款回调 | 更新退款结果（幂等） |
| `handlerTransfer` | 转账受理成功 | 记录转账单 |
| `handlerTransferTrigger` | 转账回调 | 更新转账状态（幂等） |

> 💡 **回调幂等三步**：查状态（已处理就跳过）→ 校金额（防篡改）→ 更新数据库

---

## 使用示例

### 典型支付流程

```
用户: "帮我买一杯咖啡，25 元"
  ↓
AI 调用 createOrder(description="咖啡", totalFee=2500)
  ↓
弹出微信支付弹窗 → 用户输入密码
  ↓
展示支付结果卡片
  ↓
用户: "查一下这个订单"  →  AI 调用 queryOrder  →  展示订单状态
```

### 预览模式（Mock 数据）

```javascript
// 开启：不调用真实支付 API，返回模拟数据
wx.setStorageSync('mp_skills_preview_mode', true)

// 关闭：使用真实支付
wx.setStorageSync('mp_skills_preview_mode', false)
```

---

## 常见问题

<details>
<summary><b>Q: 报错 "当前环境不支持 wx.cloud.callHTTPFunction"？</b></summary>

1. 确认基础库版本 >= 3.15.1
2. 已在 `app.js` 中调用 `wx.cloud.init()`
3. 使用真机调试或体验版（非模拟器）
</details>

<details>
<summary><b>Q: 支付总是返回 mock 数据？</b></summary>

检查 `mp_skills_preview_mode` 是否为 `true`，以及后端云函数是否已部署。
</details>

<details>
<summary><b>Q: 退款报错 "订单状态不允许退款"？</b></summary>

只有 `SUCCESS`（已支付）状态的订单才能退款：
- `NOTPAY` → 使用 `closeOrder` 关闭
- `SUCCESS` → 使用 `refundOrder` 退款
- `CLOSED` → 已关闭，无法操作
</details>

<details>
<summary><b>Q: 商家转账有什么限制？</b></summary>

- 单笔：0.3 元 ~ 2000 元
- 需开通「商家转账到零钱」功能
- 用户需在微信确认收款
</details>

<details>
<summary><b>Q: 如何在生产环境使用？</b></summary>

1. 关闭预览模式
2. 金额从后端获取（禁止前端直传金额）
3. 配置好回调 URL
4. 确保无密钥暴露在前端
</details>

---

## 技术架构

```
┌──────────────── 小程序前端 ────────────────┐
│  AI Agent → payment-skill → apis/接口      │
│                    ↓                        │
│         wx.cloud.callHTTPFunction           │
│         (自动鉴权 + 注入 openid)            │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────── 云开发环境 ─────────────────┐
│        pay-common (HTTP 云函数)             │
│  Express → routes → controllers → services │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────── 微信支付 V3 ────────────────┐
│    统一下单 / 查询 / 退款 / 关单 / 转账     │
└────────────────────────────────────────────┘
```

---

## License

MIT
