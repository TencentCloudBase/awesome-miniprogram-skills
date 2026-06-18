# party-skill

聚会安排，支持创建聚会、获取场地推荐、邀请朋友及查看聚会详情。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s party-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 创建聚会活动（名称/日期/时间/地点）
- 获取聚会场地推荐（餐厅/轰趴馆/KTV/户外）
- 邀请朋友参加聚会
- 查看聚会详情与成员状态

## 用户输入示例

- "周末搞个聚会"
- "推荐几个聚会场所"
- "邀请朋友来玩"
- "看看聚会详情"
- "创建个生日派对"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `createParty` | 创建聚会活动 |
| `getRecommendations` | 获取聚会推荐（餐厅/场地/娱乐场所） |
| `inviteFriends` | 邀请朋友参加聚会 |
| `getPartyDetails` | 查看聚会详情 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/party-create-card/index` | 聚会创建表单 |
| `components/recommend-card/index` | 聚会推荐列表 |
| `components/invite-card/index` | 邀请朋友界面 |
| `components/party-detail-card/index` | 聚会详情展示 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `party-skill-handler` |
| 数据库集合 | `parties` |
