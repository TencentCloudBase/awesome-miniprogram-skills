# Awesome WeChat Mini Program Skills

微信小程序 **AI 开发模式** 的 Skills 示例集合。

> 把小程序业务封装成 AI 可调用的 Skill —— 用户通过自然语言就能完成点单、排队、查天气等操作。

## 什么是微信小程序 AI 开发模式

[AI 开发模式](https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html) 是微信小程序提供的一种 AI 驱动的人机交互范式。开发者将业务封装为 **Skill**（技能），每个 Skill 包含原子接口和卡片组件，AI 理解用户自然语言后自动调用对应的接口和组件来完成业务。

简单说：**用户用说的，开发者写 Skill，AI 来编排执行。**

## 仓库定位

- 开箱即用的 Skill 参考实现，从简单到复杂
- 基于腾讯云开发（CloudBase）全栈
- 遵循微信 AI 开发模式规范

## 适用场景

| 类型 | 特点 | 举例 |
|------|------|------|
| 点单交易 | 选品→确认→支付 | 咖啡、订餐、买菜、票务 |
| 预约取号 | 搜索→预约→查进度 | 排队、挂号、维修、酒店 |
| 信息查询 | 搜索→展示结果 | 天气、公交、快递、周边 |
| 清单管理 | 增删改查 | 待办、购物、收藏 |
| 客服引导 | 多轮收集→提交 | 退换货、投诉、咨询 |

不适合：纯内容浏览、高频编辑、强拖拽/手势交互。

## Skills 一览

| # | Skill | 场景 | 链路 | 复杂度 | 截图 |
|---|-------|------|------|--------|------|
| 1 | **[drink-skill](./skills/drink-skill/SKILL.md)** | 咖啡点单 | 推荐/搜索 → 详情 → 规格 → 地址 → 下单支付 | ⭐⭐⭐ |  |
| 2 | **[queue-skill](./skills/queue-skill/SKILL.md)** | 门店排队取号 | 搜门店 → 排队状态 → 取号 → 查进度 | ⭐⭐ |  |
| 3 | **[todolist-skill](./skills/todolist-skill/SKILL.md)** | 简单待办 | 查列表 → 新增 → 标记完成 → 删除 | ⭐ |  |
| 4 | **[water-tracker](./skills/water-tracker/SKILL.md)** | 喝水记录 | 记录喝水 → 拉取记录 | ⭐ |  |

> 截图列预留，后续补齐对话截图或卡片展示图。

每个 Skill 的结构：

```
skills/<name>/
├── SKILL.md    # 给 AI 读的说明书（触发场景、接口链路、使用顺序）
├── mcp.json    # 原子接口声明（AI 可调用的工具列表）
├── index.js    # 入口，导出所有接口
├── apis/       # 接口实现
├── components/ # 卡片组件
├── data/       # 种子数据
└── utils/      # 工具函数
```

- **drink-skill** 接口：`getRecommendedDrinks` `searchDrinks` `selectDrink` `confirmSku` `saveAddress` `getAddress` `confirmOrder` `payOrder` `getStoreStatus`
- **queue-skill** 接口：`searchStores` `getStoreQueueStatus` `takeQueueNumber` `getQueueProgress`
- **todolist-skill** 接口：`list` `add` `toggle` `remove`
- **water-tracker** 接口：`addWaterRecord` `getWaterRecords`

## 模板分类

- **点单类**（A）：`drink-skill` → 参考：订餐、买菜、鲜花、票务
- **预约类**（B）：`queue-skill` → 参考：打车、酒店、挂号、维修
- **信息查询类**（C）：待补充 → 天气、公交、周边

## 学习路径

```
Step 1 → todolist-skill    最小结构
Step 2 → queue-skill       中等复杂度拆分
Step 3 → drink-skill       完整业务链路
```

## Skill 结构

```
skills/<name>/
├── SKILL.md    # 给 AI 读的说明书（触发场景、接口链路、使用顺序）
├── mcp.json    # 原子接口声明（AI 可调用的工具列表）
├── index.js    # 入口，导出所有接口
├── apis/       # 接口实现
├── components/ # 卡片组件
├── data/       # 种子数据
└── utils/      # 工具函数
```

## 快速开始

1. 克隆 → 2. 微信开发者工具导入 → 3. 配 AppID（需 AI 模式资格）
4. 关联 CloudBase 环境 → 5. 部署 `cloudfunctions/ai-handler/`
6. 导入种子数据（`drink-skill/data/seed.js` + `queue-skill/data/seed.js`）
7. 编译运行，打开 AI 模式

## 新增一个 Skill

1. 创建 `skills/<name>/`
2. 写 `SKILL.md`（触发场景 + 接口链路 + 使用顺序）
3. 写 `mcp.json`（原子接口声明）
4. 实现 `index.js` + `apis/` + `components/`
5. 在 `app.json` 的 `agent.skills` 中注册
6. `wxa-skills-validate` 校验

## 官方资源

- [AI 开发模式官方文档](https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html)
- [AI 模式 Skills 官方仓库](https://github.com/wechat-miniprogram/ai-mode-skills)
- wxa-skills-generate / validate / eval 等工具链见官方仓库

## 项目结构

```
├── app.js / app.json / app.wxss    # 小程序入口
├── pages/                           # 首页
├── packageDetail/                   # 点单详情分包（SKU 选择、地址编辑）
├── skills/                          # ⭐ Skill 示例集合
│   ├── drink-skill/                 # 咖啡点单
│   ├── queue-skill/                 # 门店排队取号
│   ├── todolist-skill/              # 简单待办
│   └── water-tracker/               # 喝水记录
├── cloudfunctions/                  # 云函数
│   └── ai-handler/                  # AI 模式云函数入口
├── page-meta.json                   # 页面元数据（AI 模式路由）
└── project.config.json              # 小程序项目配置
```

## 贡献

欢迎 PR 新增 Skill！参考模板：简单教学→ `todolist-skill`，预约类→ `queue-skill`，点单类→ `drink-skill`。

---

> 基于腾讯云开发（CloudBase）全栈的微信小程序 AI Skills 示例集合。
