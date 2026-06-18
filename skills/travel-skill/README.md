# travel-skill

旅行规划，支持搜索目的地、查看行程方案、查询天气及获取旅行贴士。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s travel-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 搜索热门旅行目的地
- 查看目的地的交通方案与酒店推荐
- 查询目的地当前天气情况
- 获取通用旅行贴士建议

## 用户输入示例

- "想去旅行"
- "推荐几个旅游目的地"
- "三亚有什么好玩的"
- "查一下丽江的天气"
- "规划一下大理的行程"
- "旅游注意事项"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchDestinations` | 搜索热门旅行目的地 |
| `planTrip` | 查看指定目的地的行程规划方案（交通+住宿） |
| `getWeatherInfo` | 查询指定目的地当前天气 |
| `getTravelTips` | 获取通用旅行贴士建议列表 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/destination-list-card/index` | 目的地列表展示 |
| `components/trip-plan-card/index` | 行程规划方案展示 |
| `components/weather-card/index` | 天气信息展示 |
| `components/tips-card/index` | 旅行贴士列表 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `travel-skill-handler` |
| 数据库集合 | `travel_plans` |
