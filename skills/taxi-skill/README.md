# taxi-skill

出行打车，支持预估行程、呼叫出租车、查看行程状态及历史记录。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s taxi-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 预估各车型（快车/专车/拼车）价格与时长
- 发起叫车请求
- 实时查看行程状态与司机信息
- 查看历史行程记录

## 用户输入示例

- "打个车"
- "我要去机场"
- "从国贸到三里屯多少钱"
- "叫个快车"
- "车到哪了"
- "看看我的行程记录"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `estimateTrip` | 预估行程价格与时长 |
| `callTaxi` | 呼叫出租车 |
| `getTripStatus` | 查看行程状态 |
| `getTripHistory` | 查看历史行程 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/trip-estimate-card/index` | 行程预估卡片 |
| `components/calling-taxi-card/index` | 叫车状态卡片 |
| `components/trip-status-card/index` | 行程状态卡片 |
| `components/trip-history-card/index` | 历史行程列表卡片 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `taxi-skill-handler` |
| 数据库集合 | `trips` |
