---
name: wxa-create-ai-miniprogram
description: 从零创建带 AI 能力的微信小程序项目。当用户想创建一个全新的微信小程序（不是已有项目上添加功能）时触发。集成云开发、数据库、登录、支付等能力。需要 Node.js 18+ 和 mp-skills CLI。
metadata:
  author: TencentCloudBase
  version: 0.1.0
compatibility: [mp-skills CLI, Node.js 18+]
---

# wxa-create-ai-miniprogram

从零创建带 AI 能力的微信小程序项目。

## 职责边界

**做什么**：
- 了解用户需求，推荐小程序功能方案
- 选择合适的模板创建项目骨架
- 安装首批 AI Skill
- 引导用户完成云开发配置

**不做什么**：
- 在已有项目中添加 Skill（交给 wxa-create-mp-skill）
- 搜索安装社区 Skill（交给 wxa-find-skills）
- 帮用户填写 appid 或云环境 ID（需要用户自行获取）

## 参考资料

命令参考：
- `npx mp-skills new <name>` — 创建新项目骨架
- `npx mp-skills add <repo> --skill <name>` — 安装 Skill
- `npx mp-skills add <repo> --all` — 安装全部 Skill
- `npx mp-skills setup` — 初始化环境
- `npx mp-skills list` — 查看已安装技能

## 硬性约束

- 必须使用 `npx mp-skills new <name>` 创建项目，不要手动搭建
- 创建后 project.config.json 中的 appid 需要用户自行填写（微信公众平台注册获取）
- 安装 Skill 后必须提示用户执行 `npx mp-skills setup`
- 不要替用户填写云环境 ID，引导用户去云开发控制台获取
- 创建完成后问用户是否需要更多调整

## 工作流

### Step 1 — 需求分析

与用户对话，了解他们的想法：

- 这个小程序是做什么的？
- 目标用户是谁？
- 需要哪些核心功能？

参考 TencentCloudBase/awesome-miniprogram-skills 仓库中的现有 Skill 类型给建议：

| Skill | 功能 | 适用场景 |
|-------|------|---------|
| greet-skill | 首页欢迎引导 | 所有项目（推荐安装） |
| queue-skill | 门店排队取号 | 餐饮、服务行业 |
| order-skill | 外卖点餐 | 餐饮外卖 |
| shopping-skill | 潮玩购物 | 电商零售 |
| taxi-skill | 出行打车 | 出行服务 |
| hospital-skill | 医院挂号 | 医疗健康 |
| travel-skill | 旅行规划 | 旅游出行 |
| bill-skill | 生活缴费 | 公共服务 |
| party-skill | 聚会安排 | 社交活动 |
| todolist-skill | 待办事项 | 效率工具 |
| payment-skill | 微信支付 | 通用支付能力 |
| water-tracker | 喝水记录 | 健康打卡 |

输出一个简短方案（3-5 句话）：目标用户、核心功能、推荐的 Skill。

### Step 2 — 创建项目

用户确认方案后，执行：

```bash
npx mp-skills new <project-name>
cd <project-name>
```

输出示例：
```
* 创建项目: my-app
  ok  项目骨架已生成
  ok  git 仓库已初始化

[OK] 项目已创建: my-app
   cd my-app
     在 project.config.json 中填写 appid（微信公众平台获取）
   ...
```

### Step 3 — 安装首批 Skill

根据方案推荐安装 Skill。至少安装 greet-skill（首页引导卡片）：

```bash
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill greet-skill
```

以及推荐业务 Skill：

```bash
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill <业务Skill名>
```

也可以一次性安装全部：

```bash
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --all
```

### Step 4 — 引导配置

告诉用户还需要手动完成以下步骤：

**4.1 填写 appid** —— 在 `project.config.json` 中设置 appid（微信公众平台获取）

**4.2 填写云环境 ID** —— 在 `miniprogram/app.js` 中将 `CLOUD_ENV_ID` 替换为实际环境 ID（云开发控制台获取）

**4.3 运行 setup**：

```bash
npx mp-skills setup
```

这会交互式选择云环境、聚合云函数、生成 cloudbaserc.json、初始化数据库。

**4.4 打开项目**：

```bash
# macOS
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project <项目路径>

# Windows
"C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" open --project <项目路径>
```

### Step 5 — 收尾

问用户是否需要：
- 再添加更多 Skill（回到 Step 3 或转 wxa-find-skills）
- 在已有 Skill 上添加自定义能力（转 wxa-create-mp-skill）

---

## 可用工具

创建完成后，如果用户需要检查 Skill 质量或调试，可以直接使用：

| 用户需求 | 工具 |
|---------|------|
| 检查已有 Skill 是否有问题 | `npx mp-skills validate <project-dir>` |
| 端到端评测 | `npx mp-skills eval` |
| 查看已安装 | `npx mp-skills list` |
