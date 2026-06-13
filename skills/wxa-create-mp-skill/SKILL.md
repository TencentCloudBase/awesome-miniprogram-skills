---
name: wxa-create-mp-skill
description: 在已有小程序项目中创建新的 AI Skill。当用户想在现有项目中添加自定义 AI 能力（而非安装现成的社区 Skill）时触发。完整流程：理解需求 → 设计接口 → 调用 wxa-skills-generate 生成代码 → wxa-skills-validate 校验通过。
metadata:
  author: TencentCloudBase
  version: 0.1.0
compatibility: [mp-skills CLI, Node.js 18+, 微信开发者工具]
---

# wxa-create-mp-skill

在已有小程序项目中创建新的 AI Skill。

## 职责边界

**做什么**：
- 理解用户需求，设计原子接口
- 产出 SKILL.md + mcp.json 设计文档
- 调用 wxa-skills-generate 生成完整代码
- 调用 wxa-skills-validate 校验、执行、渲染
- 修复校验问题直至全部通过

**不做什么**：
- 创建新小程序项目（交给 wxa-create-ai-miniprogram）
- 搜索安装社区 Skill（交给 wxa-find-skills）
- 修改小程序主包代码（如 app.js、页面文件）

## 参考资料

### 引用文件列表

以下文件路径在执行环境中可用，AI 可以直接读取：

| 文件 | 用途 |
|------|------|
| `<validate-dir>/references/VALIDATE_RULES.md` | V001~V016 校验规则详解 |
| `<validate-dir>/SKILL.md` | 校验和修复完整流程 |
| `<generate-dir>/references/CODE_TEMPLATES.md` | 代码模板和 mcp.json 格式 |
| `<generate-dir>/references/ATOMIC_COMPONENT_DESIGN.md` | 原子组件设计规范 |
| `<generate-dir>/references/JSAPI_WHITELIST.md` | wx API 白名单 |
| `<generate-dir>/SKILL.md` | 代码生成完整规范 |
| `<project>/SKILL-DEV-GUIDE.md` | 项目开发指南和 WeCard 规范 |

> `<validate-dir>` 和 `<generate-dir>` 通过 `npx mp-skills --help` 底部的"工具型 Skill 路径"获取。

## 硬性约束

- 项目必须已执行过 `npx mp-skills setup`（存在 cloudbaserc.json 或 skills/ 目录）
- 接口命名 camelCase，如 `searchItems`、`placeOrder`
- 每个接口的 `description` 必须包含前置条件和严禁场景
  - 前置条件示例："调用前置条件：用户已进入下单页面"
  - 严禁场景示例："【严禁场景】不要用于修改已支付的订单"
- `mcp.json` 去除 `outputSchema` 后不超过 **24000 字符**
- 遵守 WeCard 设计规范（详见 SKILL-DEV-GUIDE.md 附录 A）
- 生成代码后必须调用 wxa-skills-validate 校验通过才能交付
- 不要覆盖已有的 Skill 目录
- **禁止**用注释或 try/catch 绕过校验失败——必须真正修复

## 工作流

### Step 1 — 需求理解与接口设计

与用户对话明确功能需求。好的接口设计是关键，建议拆分 3-6 个原子接口。

接口划分原则：
- 每个接口职责单一：`searchItems`、`getDetail`、`placeOrder` 各管各的
- 不要一个接口做太多事（避免 AI 选择困难）
- 也不要拆太细（避免多次 API 调用）

用户确认后再进入下一步。

### Step 2 — 产出设计文档

在 `skills/<skill-name>/` 下创建：

**SKILL.md**（业务路由说明，供 AI 模型阅读，≤ 16KB）：
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

产出后让用户确认设计。

### Step 3 — 代码生成

调用 wxa-skills-generate 生成代码。先找到 wxa-skills-generate 的路径：

```bash
npx mp-skills --help
```

底部会显示：
```
工具型 Skill 路径（供 AI 模型引用）:
  wxa-skills-generate: /Users/xxx/.mp-skills/skills/wxa-skills-generate/SKILL.md
  ...
```

读取 wxa-skills-generate 的 SKILL.md，按它的阶段式工作流执行代码生成。
它包含了完整规范：阶段 0（需求澄清）→ 阶段 1（项目扫描）→ ... → 阶段 6（配置集成）。
按它的指引走即可，不需要在这里重复每一步。

> 注意：wxa-skills-generate 会自动处理 wx API 白名单检查、
> 原子组件约束、分包配置等规范。不要绕过这些约束。

### Step 4 — 校验

找到 wxa-skills-validate 的路径：

```bash
npx mp-skills --help
```

先运行静态校验：

```bash
node <validate-dir>/scripts/validate.mjs <project-path>
```

确保 `summary.errors === 0` 且 `summary.buildStatus === "pass"`。

静态校验通过后，对每个带 `_meta.ui.componentPath` 的接口，执行：

```bash
# 执行原子接口
node <validate-dir>/scripts/execute.mjs --project <project-path> --name <api-name> --args '{}' --output ./cli-agent-run/execute-result.<name>.json

# 渲染组件（从 execute 产物继承参数）
node <validate-dir>/scripts/render.mjs --project <project-path> --from-execute ./cli-agent-run/execute-result.<name>.json --output ./cli-agent-run/render-result.<name>.json
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
| T-build 编译失败 | stage=compile + FAIL | 先检查集成配置，再动源码 |

修复后重跑校验，直到全部通过。

### Step 6 — 收尾

确认 `app.json` 的 `agent.skills[]` 中已包含新 Skill。
提示用户运行 `npx mp-skills setup` 完成环境配置。
