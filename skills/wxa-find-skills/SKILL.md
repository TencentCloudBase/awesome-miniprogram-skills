---
name: wxa-find-skills
description: 搜索和安装社区小程序 AI Skill。当用户想在现有小程序项目中添加 AI 能力，但不确定有什么可用的社区 Skill，或不想从头开发时触发。可以从 TencentCloudBase/awesome-miniprogram-skills 等仓库搜索、查看详情并安装。
metadata:
  author: TencentCloudBase
  version: '0.1.0'
---

# wxa-find-skills

搜索和安装社区小程序 AI Skill。

## 职责边界

- ✅ 搜索远程仓库中的可用 Skill
- ✅ 查看 Skill 的详细描述和功能
- ✅ 将 Skill 安装到本地小程序项目
- ❌ 创建新的小程序项目（交给 `wxa-create-ai-miniprogram`）
- ❌ 在项目中创建新的自定义 Skill（交给 `wxa-create-mp-skill`）
- ❌ 修改已安装的 Skill 代码
- ❌ 上架 Skill 到社区仓库
- 📦 交付：已安装的 Skill 目录 + `app.json` 注册条目

## 术语约定

- **Skill**：完成特定场景任务的 AI 能力封装，包含原子接口 + 原子组件
- **原子接口**：对外暴露给小程序 AI 的可调用 API
- **原子组件**：渲染原子接口返回数据的 GUI 卡片
- **仓库**：托管 Skill 源码的 GitHub 仓库，如 `TencentCloudBase/awesome-miniprogram-skills`

## 依赖

- Node.js 18+
- `mp-skills` CLI（`npm install -g mp-skills`）
- 目标小程序项目（含 `project.config.json` + `app.json`）

## 参考资料索引

| 来源 | 用途 | 加载时机 |
|------|------|---------|
| `npx mp-skills --help` | mp-skills 所有命令的帮助 | 执行前确认命令参数 |
| `npx mp-skills find <keyword>` | 搜索远程仓库中的 Skill | Step 2 搜索 |
| `npx mp-skills list` | 列出已安装 Skill（避免重复安装） | Step 4 安装前 |
| `npx mp-skills add <repo> --skill <name>` | 安装指定 Skill | Step 4 安装 |
| `npx mp-skills add <repo> --all` | 安装全部 Skill | Step 2 无结果时后备 |
| `npx mp-skills remove <name>` | 移除不需要的 Skill | 用户要求移除时 |
| `npx mp-skills setup` | 安装后初始化环境 | Step 5 引导 |
| `npx mp-skills validate <project-dir>` | 校验已安装的 Skill 是否有问题 | 用户要求检查时 |
| `npx mp-skills eval` | 端到端评测 | 用户要求评测时 |

可用仓库：
- `TencentCloudBase/awesome-miniprogram-skills` — 全栈 AI Skill 仓库（含数据库 / 登录 / 支付模板）

## 硬性约束

### A. 项目检查

| 条件 | 说明 |
|------|------|
| 目标项目存在 `project.config.json` 和 `app.json` | 否则无法安装，提示用户确认项目路径 |
| 安装后必须执行 `npx mp-skills setup` | 聚合云函数、创建数据库、写入环境配置 |

### B. 阻断规则（立即停止）

| 阻断情况 | 处理方式 |
|---------|---------|
| 用户未指定搜索关键词 | 先问清楚功能需求，不要用空关键词搜索 |
| 搜索无结果 | 提示换关键词重试，或推荐 `--all` 查看全部可用 Skill |
| 用户想安装的 Skill 已存在 | 提示已安装，询问是否覆盖 |

## 工作流

### Step 1 — 理解需求

和用户对话，了解他们想要什么功能。例如：

> 用户："我想给我的小程序加一个排队取号功能"
> → 关键词：`queue`，结果从 awesome-miniprogram-skills 来

如果用户需求比较模糊，追问一两个问题明确方向，但不要过度分析。

### Step 2 — 搜索 Skill

执行搜索命令：

```bash
npx mp-skills find <keyword>
```

输出类似：
```
queue-skill         门店排队取号 — 搜索门店、取号、查看排队进度
order-skill         外卖点餐 — 搜索餐厅、浏览菜单、下单
...
```

把搜索结果展示给用户，简要说明每个 Skill 的用途。

**搜索无结果时**：
1. 建议换关键词重试
2. 或执行 `npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --all` 查看全部可用 Skill
3. 或转 `wxa-create-mp-skill` 创建自定义 Skill

### Step 3 — 用户确认

让用户选择要安装的 Skill。如果用户不确定，根据需求推荐最合适的：

> "queue-skill 支持搜索门店、取号、查看排队进度，和您说的排队取号功能匹配。"

### Step 4 — 安装

先列出已安装的 Skill（避免重复安装）：

```bash
npx mp-skills list
```

然后安装：

```bash
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills --skill <skill-name>
```

安装完成后输出类似：
```
  ok  已安装 queue-skill
  ok  已记录版本
```

### Step 5 — 引导后续

告知用户配置完成之前还需要执行：

```bash
cd <项目目录>
npx mp-skills setup
```

这会交互式选择云环境、聚合云函数、生成 cloudbaserc.json、初始化数据库。
之后用微信开发者工具打开项目即可预览。
