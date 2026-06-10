# Awesome WeChat Mini Program Skills

> [!NOTE]
> 本项目处于 **Alpha** 阶段，API 仍在快速迭代，可能发生不兼容变更。  
> 欢迎下载体验、提交 Issue 反馈问题，或通过 PR 贡献代码。

微信小程序 **AI 开发模式** 的 Skill 集合。

<div align="center">
  <img src="assets/screenshots/overview.png" width="700" alt="项目概览">
</div>

> 把小程序业务封装成 AI 可调用的 Skill —— 用户通过自然语言就能完成点单、排队、查天气等操作。

## 快速开始

```bash
# 查看本仓库有哪些 Skill
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --list

# 安装某个 Skill 到你的项目
cd your-project
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill drink-skill

# 或克隆本仓库预览
git clone https://github.com/TencentCloudBase/awesome-miniprogram-skills.git
cd awesome-miniprogram-skills
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project .
```

## Skills 一览

每个 Skill 的详细说明见各自目录下的 `README.md`。

<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/drink-recommended.png" width="280" alt="drink-skill"><br><b><a href="skills/drink-skill/README.md">drink-skill</a></b><br>咖啡点单 · 10 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/order-search-restaurants.png" width="280" alt="order-skill"><br><b><a href="skills/order-skill/README.md">order-skill</a></b><br>外卖点餐 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/hospital-list.png" width="280" alt="hospital-skill"><br><b><a href="skills/hospital-skill/README.md">hospital-skill</a></b><br>医院挂号 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/taxi-estimate.png" width="280" alt="taxi-skill"><br><b><a href="skills/taxi-skill/README.md">taxi-skill</a></b><br>出行打车 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/travel-destinations.png" width="280" alt="travel-skill"><br><b><a href="skills/travel-skill/README.md">travel-skill</a></b><br>旅行规划 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/shopping-products.png" width="280" alt="shopping-skill"><br><b><a href="skills/shopping-skill/README.md">shopping-skill</a></b><br>潮玩购物 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/bill-list.png" width="280" alt="bill-skill"><br><b><a href="skills/bill-skill/README.md">bill-skill</a></b><br>生活缴费 · 3 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/party-create.png" width="280" alt="party-skill"><br><b><a href="skills/party-skill/README.md">party-skill</a></b><br>聚会安排 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/queue-store-list.png" width="280" alt="queue-skill"><br><b><a href="skills/queue-skill/README.md">queue-skill</a></b><br>门店排队 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/todo-list.png" width="280" alt="todolist-skill"><br><b><a href="skills/todolist-skill/README.md">todolist-skill</a></b><br>简单待办 · 4 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/water-records.png" width="280" alt="water-tracker"><br><b><a href="skills/water-tracker/README.md">water-tracker</a></b><br>喝水记录 · 2 API</div>
  <div style="text-align: center; flex: 1 1 280px; max-width: 320px;"><img src="assets/screenshots/payment-card.png" width="280" alt="payment-skill"><br><b><a href="skills/payment-skill/README.md">payment-skill</a></b><br>微信支付 · 2 API</div>
</div>

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
│   ├── water-tracker/                    # 喝水记录
│   └── payment-skill/                    # 微信支付
├── cli/                                  # mp-skills CLI 工具
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

## 部署与调试

本项目推荐配合 **CloudBase Skill** 和 **MCP 工具** 完成云资源部署和调试：

- 在 CodeBuddy 中安装 [CloudBase Skill](https://docs.cloudbase.net/ai/cloudbase-ai-toolkit/#%E7%AC%AC-2-%E6%AD%A5%E6%8C%89%E9%9C%80%E5%AE%89%E8%A3%85-cloudbase-ai-skill%E5%8F%AF%E9%80%89)，自动识别环境并部署云函数与数据库
- 使用 MCP 工具管理云函数、数据库集合和数据模型
- 所有接口支持**双模式运行**：默认预览模式走本地 seed/mock 数据；切换到正式模式后调用独立云函数。无需云开发环境也能通过 seed 数据体验完整流程

## 开发

```bash
# 微信开发者工具打开项目
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project /path/to/project

# 静态校验
node <validate-path>/scripts/validate.mjs <project-path>

# 原子接口执行
node <validate-path>/scripts/execute.mjs --project <project-path> --name <api-name> --auto-port 9420

# 原子组件渲染
node <validate-path>/scripts/render.mjs --project <project-path> --from-execute <execute-result.json> --auto-port 9420
```

## 许可证

MIT
