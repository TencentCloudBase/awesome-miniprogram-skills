---
name: wxa-create-mp-skill
description: 在已有小程序项目中创建新的 AI Skill。当用户想在现有项目中添加自定义 AI 能力（而非安装现成的社区 Skill）时触发。完整流程：理解需求 → 设计接口 → 调用 wxa-skills-generate 生成代码 → wxa-skills-validate 校验通过。
metadata:
  author: TencentCloudBase
  version: '0.1.0'
compatibility: [mp-skills CLI, Node.js 18+, 微信开发者工具]
---

# wxa-create-mp-skill

在已有小程序项目中创建新的 AI Skill。

## 职责边界

- ✅ 理解用户需求，设计原子接口
- ✅ 产出 SKILL.md + mcp.json 设计文档
- ✅ 调用 wxa-skills-generate 生成完整代码
- ✅ 调用 wxa-skills-validate 校验、执行、渲染
- ✅ 修复校验问题直至全部通过
- ❌ 创建新小程序项目（交给 `wxa-create-ai-miniprogram`）
- ❌ 搜索安装社区 Skill（交给 `wxa-find-skills`）
- ❌ 修改小程序主包代码（如 app.js、页面文件）
- ❌ 上架 Skill 到应用市场
- 📦 交付：`skills/{skill-name}/` 完整分包 + `app.json` 注册

## 术语约定

- **原子接口**：对外暴露给小程序 AI 的可调用 API，约定路径 `skills/{skill}/apis/{name}.js`
- **原子组件**：渲染原子接口返回数据的 UI 卡片，约定路径 `skills/{skill}/components/{name}/`
- **SKILL.md**：AI 路由元数据，描述业务的触发场景和使用顺序，≤ 16KB
- **mcp.json**：模型可调用能力声明，去除 outputSchema 后 ≤ 24000 字符
- **Wecard 设计规范**：原子组件的视觉基线标准，详见项目 SKILL-DEV-GUIDE.md 附录 A

## 参考资料索引

| 来源 | 用途 | 加载时机 |
|------|------|---------|
| `npx mp-skills --help` | 获取 `<generate-dir>` 和 `<validate-dir>` 路径 | Step 3 前 |
| `<generate-dir>/SKILL.md` | wxa-skills-generate 的完整阶段式工作流 | Step 3 代码生成 |
| `<generate-dir>/references/CODE_TEMPLATES.md` | mcp.json / index.js / 接口实现代码模板 | Step 2/3 编写时 |
| `<generate-dir>/references/ATOMIC_COMPONENT_DESIGN.md` | 原子组件设计规范 | Step 3 组件生成 |
| `<generate-dir>/references/JSAPI_WHITELIST.md` | wx API 白名单完整清单 | Step 3 代码生成时 |
| `<validate-dir>/SKILL.md` | 校验规则和修复详细流程 | Step 4 校验 + Step 5 修复 |
| `<validate-dir>/references/VALIDATE_RULES.md` | V001~V016 规则详情 | 校验报错需定位 id 时 |
| `<validate-dir>/references/CLI_AGENT_REFERENCE.md` | execute/render 脚本用法 | Step 4 执行 |
| `<project>/SKILL-DEV-GUIDE.md` | 项目开发规范和 WeCard 视觉基线 | Step 2 设计时 |

> `<generate-dir>` 和 `<validate-dir>` 在 Step 3 中通过 `npx mp-skills --help` 获取。

## 硬性约束

### A. 项目前置条件

| 条件 | 说明 |
|------|------|
| 必须是已有的 mp-skills 项目（存在 `skills/` 目录） | 否则无法创建独立分包 |
| 项目已执行过 `npx mp-skills setup` | 确保云开发环境已就绪 |
| 不要覆盖已有的 Skill 目录 | 如已存在同名目录，提示用户换名 |

### B. 接口设计规范

| 规则 | 说明 |
|------|------|
| 接口命名 camelCase | `searchItems`、`placeOrder`，不要用 `search_items` |
| 接口粒度适中 | 每个接口职责单一，一个 skill 建议 3-6 个接口 |
| description 含前置条件 | "调用前置条件：用户已进入下单页面" |
| description 含严禁场景 | "【严禁场景】不要用于修改已支付的订单" |
| mcp.json ≤ 24000 字符 | 去除 outputSchema 后的体积限制 |

### C. 组件规范

- 遵守 WeCard 设计规范（详见 SKILL-DEV-GUIDE.md 附录 A）
- 组件路径格式：`components/{name}/index`（相对路径，不带分包前缀）
- 每个带 UI 的接口必须关联 `_meta.ui.componentPath`

### D. 阻断规则（立即停止）

| 阻断情况 | 处理方式 |
|---------|---------|
| 用户描述的功能在现有社区 Skill 中已存在 | 建议先搜索安装，不要重复创建 |
| 需求过于宏大（超过 6 个接口） | 拆分为多个独立的 Skill |
| wxa-skills-generate 无法处理 | 告知用户能力限制，提供替代方案 |
| 连续 3 轮校验仍未通过 | 标记为疑难问题，请求用户确认后继续 |

## 工作流

### Step 1 — 需求理解与接口设计

与用户对话明确功能需求。接口划分遵循以下原则：

- 每个接口职责单一：`searchItems`、`getDetail`、`placeOrder` 各管各的
- 不要一个接口做太多事（避免 AI 选择困难）
- 不要拆太细（避免多次 API 调用）
- 建议 3-6 个原子接口

输出接口清单，用户确认后再进入下一步。

### Step 2 — 产出设计文档

在 `skills/<skill-name>/` 下创建：

**SKILL.md**（业务路由说明，≤ 16KB）：
- 能力域定位
- 触发场景（few-shot 用户原话）
- 不适用范围
- 使用顺序

**mcp.json**（模型可调用能力声明，去除 outputSchema ≤ 24000 字符）：

```json
{
  "apis": [
    {
      "name": "searchItems",
      "description": "搜索商品列表。\n调用前置条件：...\n【严禁场景】...",
      "inputSchema": { "type": "object", "properties": {...}, "required": [...] },
      "_meta": { "ui": { "componentPath": "components/item-list-card/index" } }
    }
  ],
  "components": [
    { "path": "components/item-list-card/index", "relatedPage": "/pages/index/index" }
  ]
}
```

产出后让用户确认设计。确认前不得进入下一步。

### Step 3 — 代码生成

先获取官方技能路径并记录到变量：

```bash
npx mp-skills --help
```

输出底部会显示：
```
工具型 Skill 路径（供 AI 模型引用）:
  wxa-skills-generate: /Users/xxx/.mp-skills/skills/wxa-skills-generate/SKILL.md
  wxa-skills-validate: /Users/xxx/.mp-skills/skills/wxa-skills-validate/SKILL.md
```

记录两个路径（去掉末尾的 `/SKILL.md`）：
- `<generate-dir>` = wxa-skills-generate 所在目录
- `<validate-dir>` = wxa-skills-validate 所在目录

然后读取 `<generate-dir>/SKILL.md`，按它的阶段式工作流执行代码生成。
按它的指引走即可，不需要在这里重复每一步。

> 注意：wxa-skills-generate 会自动处理 wx API 白名单检查、原子组件约束、分包配置。不要绕过这些约束。

### Step 4 — 校验

使用 Step 3 中记录的 `<validate-dir>` 路径。

**4.1 静态校验**

```bash
node <validate-dir>/scripts/validate.mjs <project-path>
```

通过条件：`summary.errors === 0` 且 `summary.buildStatus === "pass"`。

**4.2 接口执行 + 组件渲染**

静态校验通过后，对每个带 `_meta.ui.componentPath` 的接口：

```bash
# 执行原子接口
node <validate-dir>/scripts/execute.mjs \
  --project <project-path> --name <api-name> --args '{}' \
  --output ./cli-agent-run/execute-result.<name>.json

# 渲染组件
node <validate-dir>/scripts/render.mjs \
  --project <project-path> \
  --from-execute ./cli-agent-run/execute-result.<name>.json \
  --output ./cli-agent-run/render-result.<name>.json
```

### Step 5 — 修复问题

如果有校验失败，按 wxa-skills-validate/SKILL.md 的修复流程处理：

| 类型 | 特征 | 修复范围 |
|------|------|---------|
| T1 命名拼写 | 字段大小写/拼写错 | 单文件单行直接改 |
| T2 Schema 不一致 | structuredContent 与 outputSchema 不匹配 | apis + mcp.json 对齐 |
| T3 组件绑定不一致 | WXML 与 setData 字段对不上 | components JS/WXML 对齐 |
| T4 组件取值路径错 | result.structuredContent.xxx 路径错 | 修组件 JS |
| T5 合规性违规 | 非白名单标签/CSS | 用白名单替代 |
| T6 注册缺失 | mcp.json 声明的 name 未 registerAPI | 补 index.js 注册 |
| T7/T8 链路/粒度 | storage key 或接口划分问题 | 跨文件调整 |
| T9 能力无法实现 | 所有候选都违反硬约束 | ⛔ 终止，告知用户 |
| T-build 编译失败 | stage=compile + FAIL | 先检查集成配置，再动源码 |

修复后重跑校验，直到全部通过。

### Step 6 — 收尾

确认 `app.json` 的 `agent.skills[]` 中已包含新 Skill。
提示用户运行 `npx mp-skills setup` 完成环境配置。
