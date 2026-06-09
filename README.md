# Awesome WeChat Mini Program Skills

微信小程序 **AI 开发模式** 的 Skill 分发市场和最佳实践集合。

> 把小程序业务封装成 AI 可调用的 Skill —— 用户通过自然语言就能完成点单、排队、查天气等操作。

## 什么是微信小程序 AI 开发模式

[AI 开发模式](https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html) 是微信小程序提供的一种 AI 驱动的人机交互范式。开发者将业务封装为 **Skill**（技能），每个 Skill 包含原子接口和卡片组件，AI 理解用户自然语言后自动调用对应的接口和组件来完成业务。

## 快速开始

```bash
# 克隆项目并在微信开发者工具中打开
git clone https://github.com/TencentCloudBase/awesome-miniprogram-skills.git
cd awesome-miniprogram-skills
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project .

# 或使用 npx skills 安装单个 Skill
npx skills add TencentCloudBase/awesome-miniprogram-skills --list
```

## Skills 一览

| Skill | 描述 | 接口 | 组件 | 截图 |
|-------|------|------|------|------|
| `drink-skill` | 咖啡点单：推荐饮品、规格选择、地址填写、下单支付 | 10 | 7 | [查看](assets/screenshots/drink-recommended.png) |
| `order-skill` | 外卖点餐：搜索餐厅、浏览菜单、下单支付、配送跟踪 | 4 | 4 | [查看](assets/screenshots/order-search-restaurants.png) |
| `hospital-skill` | 医院挂号：搜索医院科室、选择时段、预约、挂号记录 | 4 | 4 | [查看](assets/screenshots/hospital-list.png) |
| `taxi-skill` | 出行打车：行程预估、叫车、行程状态、历史记录 | 4 | 4 | [查看](assets/screenshots/taxi-estimate.png) |
| `travel-skill` | 旅行规划：目的地搜索、行程规划、天气、旅行贴士 | 4 | 4 | [查看](assets/screenshots/travel-destinations.png) |
| `shopping-skill` | 潮玩购物：商品搜索、详情、门店库存、下单 | 4 | 4 | [查看](assets/screenshots/shopping-products.png) |
| `bill-skill` | 生活缴费：待缴账单查询、缴费支付、缴费历史 | 3 | 3 | [查看](assets/screenshots/bill-list.png) |
| `party-skill` | 聚会安排：创建聚会、推荐场所、邀请好友、聚会详情 | 4 | 4 | [查看](assets/screenshots/party-create.png) |
| `queue-skill` | 门店排队取号：搜索门店、排队状态、取号、进度查询 | 4 | 4 | — |
| `todolist-skill` | 简单待办：增删改查，直接调用 wx.cloud.database | 4 | 1 | — |

每个 Skill 的详细说明见各自目录下的 `README.md`。

## 项目架构

```
├── app.json / app.js / app.wxss         # 小程序入口与全局配置
├── pages/home/home                       # 首页（AI Agent 对话入口）
├── page-meta.json                        # 页面元数据（AI 路由）
├── cloudfunctions/ai-handler/            # 云函数统一入口
├── skills/                               # Skill 独立分包（每个自包含）
│   ├── drink-skill/                      # 咖啡点单
│   ├── order-skill/                      # 外卖点餐
│   ├── hospital-skill/                   # 医院挂号
│   ├── taxi-skill/                       # 出行打车
│   ├── travel-skill/                     # 旅行规划
│   ├── shopping-skill/                   # 潮玩购物
│   ├── bill-skill/                       # 生活缴费
│   ├── party-skill/                      # 聚会安排
│   ├── queue-skill/                      # 门店排队取号
│   └── todolist-skill/                   # 简单待办
└── assets/screenshots/                   # 组件渲染截图
```

每个 Skill 是自包含的功能单元，包含前端代码（API + 组件）和可选的云函数、数据库集合定义。

## 数据流

```
用户语音/文字输入 → AI 路由（SKILL.md 匹配）
  → 原子接口执行（try wx.cloud.callFunction → seed mock）
  → 原子组件渲染（卡片 UI + tap 上行 text/api-call）
```

## 贡献

欢迎贡献新的 Skill！请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开发

```bash
# 微信开发者工具打开项目
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project /path/to/project

# 静态校验
node <validate-path>/scripts/validate.mjs <project-path>

# 原子接口执行
node <validate-path>/scripts/execute.mjs --project <project-path> --name <api-name>

# 原子组件渲染
node <validate-path>/scripts/render.mjs --project <project-path> --from-execute <execute-result.json>
```

## 许可证

MIT
