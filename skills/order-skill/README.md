# order-skill

外卖点餐，支持搜索餐厅、查看菜单、下单及查看配送状态。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s order-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 按关键词搜索附近餐厅
- 查看餐厅菜单与菜品详情
- 选择菜品并下单
- 实时查看订单配送状态与骑手信息

## 用户输入示例

- "附近有什么好吃的"
- "点个外卖"
- "我要点餐"
- "看看麦当劳有什么"
- "帮我下单"
- "外卖到哪了"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchRestaurants` | 搜索附近餐厅列表 |
| `getMenuItems` | 查看指定餐厅的菜单与菜品列表 |
| `placeOrder` | 提交订单（含菜品、地址、联系电话） |
| `getOrderStatus` | 查询订单当前配送状态 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/restaurant-list-card/index` | 餐厅列表展示 |
| `components/menu-list-card/index` | 菜单与菜品列表 |
| `components/order-confirm-card/index` | 订单确认与下单 |
| `components/order-status-card/index` | 配送状态与骑手信息 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `order-skill-handler` |
| 数据库集合 | `orders` |
