---
name: wxa-find-skills
description: 搜索和安装社区小程序 AI Skill。当用户想在现有小程序项目中添加 AI 能力，但不确定有什么可用的社区 Skill，或不想从头开发时触发。可以从 TencentCloudBase/awesome-miniprogram-skills 等仓库搜索、查看详情并安装。
metadata:
  author: TencentCloudBase
  version: 0.1.0
---

# wxa-find-skills

搜索和安装社区小程序 AI Skill。

## 职责边界

**做什么**：
- 搜索远程仓库中的可用 Skill
- 查看 Skill 的详细描述和功能
- 将 Skill 安装到本地小程序项目

**不做什么**：
- 创建新的小程序项目（交给 wxa-create-ai-miniprogram）
- 在项目中创建新的自定义 Skill（交给 wxa-create-mp-skill）
- 修改已经安装的 Skill 代码
- 上架 Skill 到社区仓库

## 参考资料

SKILL.md 内联了所有需要的参考信息，不需要额外加载外部文件。

命令参考：
- `npx mp-skills find <keyword>` — 搜索远程仓库中的 Skill
- `npx mp-skills list` — 列出已安装的 Skill
- `npx mp-skills add <repo> --skill <name>` — 安装指定 Skill
- `npx mp-skills add <repo> --all` — 安装某个仓库的全部 Skill
- `npx mp-skills remove <name>` — 移除 Skill
- `npx mp-skills setup` — 安装后初始化环境

## 硬性约束

- 安装前必须确认目标项目存在 `project.config.json` 和 `app.json`
- 安装后必须提示用户执行 `npx mp-skills setup`（聚合云函数、创建数据库、写环境配置）
- 如果用户没有指定搜索关键词，先问清楚再搜，不要用空关键词搜索

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

### Step 3 — 用户确认

让用户选择要安装的 Skill。如果用户不确定，根据他们的需求推荐最合适的。

例如推荐理由：
> "queue-skill 支持搜索门店、取号、查看排队进度，和您说的排队取号功能匹配。"

### Step 4 — 安装

先列出当前已安装的 Skill（避免重复安装）：

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

这会聚合云函数、生成 cloudbaserc.json、初始化数据库。
之后用微信开发者工具打开项目即可预览。
