# queue-skill

门店排队取号，支持搜索门店、查看排队状态、取号及查看排队进度。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s queue-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 搜索可排队门店列表
- 查看单个门店当前排队状态
- 为指定门店取号排队
- 查询排队票当前进度

## 用户输入示例

- "附近有什么店"
- "查看排队状态"
- "取个号"
- "前面还有几位"
- "排队到哪了"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchStores` | 查询可排队门店列表 |
| `getStoreQueueStatus` | 查看单个门店当前排队状态 |
| `takeQueueNumber` | 为指定门店生成排队票 |
| `getQueueProgress` | 查询排队票当前进度 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/store-list-card/index` | 门店列表展示 |
| `components/store-queue-status-card/index` | 门店排队状态展示 |
| `components/queue-ticket-card/index` | 取号结果展示 |
| `components/queue-progress-card/index` | 排队进度展示 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `queue-skill-handler` |
| 数据库集合 | `queue_tickets` |
