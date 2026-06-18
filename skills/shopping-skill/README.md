# shopping-skill

潮玩购物，支持搜索商品、查看详情、查询门店库存及下单购买。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s shopping-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 搜索或推荐潮玩商品（盲盒/手办/周边）
- 查看商品完整详情与门店库存
- 查询各门店库存情况
- 下单购买指定门店商品

## 用户输入示例

- "看看有什么潮玩"
- "最近有什么新品"
- "这个盲盒有货吗"
- "我要买这个"
- "下单"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchProducts` | 搜索或推荐潮玩商品 |
| `getProductDetail` | 查看某款潮玩商品完整详情 |
| `checkStoreStock` | 查询某款商品在各门店的库存 |
| `placeOrder` | 下单购买潮玩商品 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/product-list-card/index` | 商品列表展示 |
| `components/product-detail-card/index` | 商品详情展示 |
| `components/stock-check-card/index` | 门店库存查询 |
| `components/order-success-card/index` | 下单成功结果展示 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `shopping-skill-handler` |
| 数据库集合 | `shopping_orders` |
