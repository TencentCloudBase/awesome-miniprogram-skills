# Awesome WeChat Mini Program Skills

微信小程序 **AI 开发模式** 的 Skill 集合。

> 把小程序业务封装成 AI 可调用的 Skill —— 用户通过自然语言就能完成点单、排队、查天气等操作。

## 快速开始

```bash
# 克隆并在微信开发者工具中打开
git clone https://github.com/TencentCloudBase/awesome-miniprogram-skills.git
cd awesome-miniprogram-skills
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project .

# 或使用 npx skills 安装单个 Skill
npx skills add TencentCloudBase/awesome-miniprogram-skills --list
```

## Skills 一览

| Skill | 描述 | API | 组件 | 云函数 | 数据库 |
|-------|------|-----|------|--------|--------|
| `drink-skill` | 咖啡点单 | 10 | 7 | drink-skill-handler | drink_orders, drink_addresses |
| `order-skill` | 外卖点餐 | 4 | 4 | order-skill-handler | orders |
| `hospital-skill` | 医院挂号 | 4 | 4 | hospital-skill-handler | hospital_appointments |
| `taxi-skill` | 出行打车 | 4 | 4 | taxi-skill-handler | trips |
| `travel-skill` | 旅行规划 | 4 | 4 | travel-skill-handler | travel_plans |
| `shopping-skill` | 潮玩购物 | 4 | 4 | shopping-skill-handler | shopping_orders |
| `bill-skill` | 生活缴费 | 3 | 3 | bill-skill-handler | bill_records |
| `party-skill` | 聚会安排 | 4 | 4 | party-skill-handler | parties |
| `queue-skill` | 门店排队取号 | 4 | 4 | queue-skill-handler | queue_tickets |
| `todolist-skill` | 简单待办 | 4 | 1 | todolist-skill-handler | todo_items |
| `water-tracker` | 喝水记录 | 2 | 2 | water-tracker-handler | water_daily, water_profile |

每个 Skill 的详细说明见各自目录下的 `README.md`。

## 项目架构

```
├── app.json / app.js / app.wxss         # 小程序入口与全局配置
├── pages/home/home                       # 首页（AI Agent 对话入口）
├── page-meta.json                        # 页面元数据（AI 路由）
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
│   ├── todolist-skill/                   # 简单待办
│   └── water-tracker/                    # 喝水记录
└── assets/screenshots/                   # 组件渲染截图
```

每个 Skill 是自包含的功能单元，包含前端代码（API + 组件）和可选的云函数、数据库集合定义。

## 数据流

```
用户输入 → AI 路由（SKILL.md 匹配）
  → 原子接口（预览模式走 seed mock / 正式模式走云函数）
  → 原子组件（卡片 UI + tap 上行 api/call）
```

所有 Skill 支持双模式运行：
- **预览模式**（默认）：`mp_skills_preview_mode = true`，走本地 seed/mock 数据，无需云开发环境
- **正式模式**：`mp_skills_preview_mode = false`，调用独立云函数，连接云数据库

## Skill 开发范式

详细说明见 [SKILL-DEV-GUIDE.md](SKILL-DEV-GUIDE.md)。

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
