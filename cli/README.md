# mp-skills

让微信小程序接入 AI 生态——为小程序安装 `wx.modelContext` Skill，构建 AI 友好的小程序。

```bash
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --list
```

---

## 快速开始

### 安装一个 Skill

```bash
# 查看仓库中有哪些可用 Skill
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --list

# 安装指定的 Skill
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill drink-skill

# 安装仓库中所有 Skill
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --all
```

命令需要在**小程序项目根目录**下执行（含 `miniprogram/app.json`）。安装后自动：

- 拷贝 Skill 到 `skills/<name>/`
- 更新 `miniprogram/app.json` 的 `agent.skills` + `subPackages`
- 更新 `project.config.json` 的 `packOptions.include`
- 写入 `skills-lock.json` 版本锁

## 命令

| 命令 | 描述 |
|------|------|
| `add` | 从 GitHub 仓库或本地路径安装 Skill |
| `find` | 搜索远程仓库中的可用 Skill |
| `list` | 列出已安装的 Skill |
| `remove` | 移除已安装的 Skill |
| `update` | 检查并更新已安装的 Skill |
| `init` | 在当前目录创建空的 Skill 模板 |
| `create` | 创建新的小程序项目骨架 |
| `validate` | 静态校验 (需 wxa-skills-validate) |
| `execute` | 执行原子接口 |
| `render` | 渲染原子组件 |

### add

从 GitHub 仓库或本地路径安装 Skill 到当前项目。

```bash
# GitHub shorthand
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --list

# 安装指定 Skill
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill drink-skill

# 安装全部
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --all

# 本地路径
npx mp-skills add ./my-local-skill
```

### find

跨仓库搜索可用的 Skill。

```bash
# 列出所有远程可用 Skill
npx mp-skills find

# 按关键词搜索
npx mp-skills find 咖啡
npx mp-skills find payment
npx mp-skills find 挂号
```

### list

列出当前项目已安装的 Skill。

```bash
npx mp-skills list
```

### remove

移除已安装的 Skill。

```bash
npx mp-skills remove drink-skill
npx mp-skills remove --all
```

### update

检查已安装 Skill 是否有更新。

```bash
# 检查所有
npx mp-skills update

# 检查指定
npx mp-skills update drink-skill payment-skill
```

### init

在当前目录创建一个符合 wx.modelContext 规范的空 Skill 模板。

```bash
npx mp-skills init my-skill
```

生成结构：

```
my-skill/
├── mcp.json
├── SKILL.md
├── index.js
├── apis/
├── utils/
└── components/greeting-card/
```

### create

创建一个新的小程序项目，含 AI Skill 支持的基础配置。

```bash
npx mp-skills create my-app
cd my-app
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill drink-skill
```

## add 做了什么

```
项目目录/
├── miniprogram/app.json      ← 自动注入 agent.skills + subPackages + lazyCodeLoading
├── project.config.json       ← 自动注入 packOptions.include
├── skills/<name>/            ← 拷贝 Skill 全套文件
│   ├── mcp.json              ← API Schema
│   ├── SKILL.md              ← 业务流程
│   ├── index.js              ← 注册入口
│   ├── apis/                 ← 原子接口
│   └── components/           ← 原子组件
└── skills-lock.json          ← 版本追踪
```

## 安装

```bash
npm install -g mp-skills
# 或直接用 npx
npx mp-skills --help
```

## 从源码使用

```bash
git clone https://github.com/TencentCloudBase/awesome-miniprogram-skills.git
cd awesome-miniprogram-skills/cli
npm install
npm run build
npm link
mp-skills --help
```

## 技术栈

- TypeScript + ESM
- [commander.js](https://github.com/tj/commander.js) — CLI 框架
- GitHub Trees API — 远程 Skill 发现（无需 git clone）
- `skills-lock.json` — 版本追踪 + 增量更新

## 相关链接

- [awesome-miniprogram-skills](https://github.com/TencentCloudBase/awesome-miniprogram-skills) — 完整 Skill 仓库
- [wechat-miniprogram/ai-mode-skills](https://github.com/wechat-miniprogram/ai-mode-skills) — 微信官方 Skill 示例
- [微信小程序 AI 开发模式文档](https://developers.weixin.qq.com/miniprogram/dev/ai/guide.html)
