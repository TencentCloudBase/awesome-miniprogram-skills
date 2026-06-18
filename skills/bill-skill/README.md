# bill-skill

生活缴费，支持查询待缴账单、完成缴费及查看历史缴费记录。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s bill-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 用户输入示例

- "帮我查一下这个月的水电费"
- "我要缴电费"
- "燃气费欠了多少？"
- "看看我的缴费记录"
- "话费该交了"
- "帮我交一下物业费"
- "最近三个月交了多少水电费"

## 功能

- 查询当前用户的所有待缴账单（水费/电费/燃气费/话费/物业费）
- 为指定账单完成缴费支付
- 查看历史缴费记录

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `getBills` | 查询当前用户所有待缴账单 |
| `payBill` | 为指定账单完成缴费支付 |
| `getPaymentHistory` | 查询历史缴费记录 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/bill-list-card/index` | 待缴账单列表 |
| `components/pay-result-card/index` | 缴费结果展示 |
| `components/history-card/index` | 历史缴费记录列表 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `bill-skill-handler` |
| 数据库集合 | `bill_records` |
