# Skill 开发范式

本文档描述本项目的 Skill 开发规范。遵循这些规范可以保证 Skill 的一致性、可维护性和可部署性。

> **重要**：创建任何新 Skill 前，必须先完整阅读 `wxa-skills-generate` Skill，它是最权威的生成指南，包含：
> - 原子组件设计规范（`references/ATOMIC_COMPONENT_DESIGN.md`）
> - 代码模板（`references/CODE_TEMPLATES.md`）
> - 组件模板（`references/COMPONENT_TEMPLATES.md`）
> - CSS 实现规范（`references/ATOMIC_COMPONENT_CSS.md`）
> - wx API 白名单（`references/JSAPI_WHITELIST.md`）
> - 分析模式（`references/ANALYSIS_PATTERNS.md`）
> - 样式迁移（`references/STYLE_MIGRATION.md`）
> - 半屏页面规范（`references/HALF_SCREEN.md`）
>
> 路径：`~/.codebuddy/skills/wxa-skills-generate/SKILL.md`（以实际安装路径为准）

## 开发流程：先设计，再实现

每个新 Skill 的开发遵循以下步骤：

### 第 1 步：设计（SKILL.md）

创建 `skills/<skill-name>/SKILL.md`，包含：

- **YAML frontmatter**：name、description、version、tags
- **设计目标**：为什么需要这个 Skill，解决什么问题
- **业务流程图**：用 ASCII 图描述流程（可选）
- **原子接口**：每个接口的参数、返回值、前置条件、后续接口
- **原子组件**：组件的功能和交互行为
- **云函数**：支持的 action、数据流向
- **数据库**：集合结构和字段定义
- **设计约束**：边界条件、安全规则、幂等要求
- **集成方式**：如果被其他 Skill 调用，描述调用方如何集成
- **实现计划**：从设计到完成的步骤清单

不需要在这个阶段写任何代码。

### 第 2 步：评审

确认设计完整后，先合并 SKILL.md，再进入实现阶段。

### 第 3 步：实现

按照 SKILL.md 中的实现计划，逐一完成：

1. `mcp.json` — 接口和组件声明
2. `utils/util.js` — 工具函数
3. `apis/` — 原子接口实现
4. `components/` — 原子组件
5. `cloudfunctions/` — 云函数
6. `database/` — 数据库定义
7. `index.js` — 注册入口
8. `README.md` — Skill 说明

### 第 4 步：测试

```bash
# 静态校验
node ~/.codebuddy/skills/wxa-skills-validate/scripts/validate.mjs <project-path>

# 原子接口执行测试
node ~/.codebuddy/skills/wxa-skills-validate/scripts/execute.mjs --project <project-path> --name <api-name>

# 原子组件渲染测试
node ~/.codebuddy/skills/wxa-skills-validate/scripts/render.mjs --project <project-path> --name <api-name>
```

### 第 5 步：注册

在 `app.json` 的 `agent.skills[]` 中添加注册条目。

---

## 目录结构

```
skills/<skill-name>/
├── SKILL.md                    # AI 路由元数据（必须）
├── mcp.json                    # API + 组件声明（必须）
├── index.js                    # 注册入口（必须）
├── apis/                       # 原子接口（必须）
│   ├── api1.js
│   └── api2.js
├── components/                 # 原子组件（必须）
│   └── <card-name>/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── data/                       # 种子数据（推荐）
│   └── seed.js
├── utils/                      # 工具函数（推荐）
│   └── util.js
├── cloudfunctions/             # 云函数（可选，最多一个）
│   └── <skill-name>-handler/
│       ├── index.js
│       └── package.json
├── database/                   # 数据库集合定义（可选）
│   └── collections.json
└── README.md                   # 本 Skill 说明（推荐）
```

## 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| Skill 目录 | kebab-case | `drink-skill`, `order-skill` |
| API 名 | camelCase | `searchStores`, `placeOrder` |
| 组件目录 | kebab-case | `store-list-card`, `order-confirm-card` |
| 云函数名 | `{skill-name}-handler` | `queue-skill-handler` |
| 数据库集合 | 语义化复数 | `queue_tickets`, `todo_items` |
| Storage key | 带 skill 前缀 | `mp_skills_todos`, `skills_queue_ticket_xxx` |

## SKILL.md

SKILL.md 包含 AI 路由元数据和接口链路说明。文件头必须包含 YAML frontmatter：

```markdown
---
name: my-skill
description: 简短描述
version: "1.0.0"
tags: ["微信小程序", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# my-skill 功能名称

## 触发场景
用户原话举例：
- "帮我..."

## 不适用范围
- ...

## 接口链路
- `api1`：说明
- `api2`：说明

## 使用顺序
- 先...
- 再...
```

## mcp.json

声明 API 和组件的契约文件：

```json
{
  "apis": [
    {
      "name": "searchItems",
      "description": "搜索商品列表。\n调用前置条件：...\n【严禁场景】...",
      "inputSchema": { ... },
      "outputSchema": { ... },
      "_meta": {
        "ui": {
          "componentPath": "components/item-list-card/index"
        }
      }
    }
  ],
  "components": [
    {
      "path": "components/item-list-card/index",
      "relatedPage": "/pages/home/home"
    }
  ]
}
```

API 的 description 中需要包含：
- 调用前置条件
- 严禁场景（用【】标注）

## API 实现

每个 API 是一个 async function，支持**双模式**运行：

```javascript
const { isPreviewMode, successResult, errorResult, defaultData } = require('../utils/util')

async function myApi(params = {}) {
  // 预览模式：直接返回 seed/mock 数据
  if (isPreviewMode()) {
    return successResult('操作成功', defaultData())
  }

  // 正式模式：调用云函数
  const { result } = await wx.cloud.callFunction({
    name: 'my-skill-handler',
    data: { action: 'myApi', ...params }
  })

  if (result && result.code === 0 && result.data) {
    return successResult('操作成功', result.data)
  }
  return errorResult(result?.message || '请求失败')
}

module.exports = myApi
```

### 返回值格式

每个 API 返回统一的三层数据结构：

```javascript
{
  isError: false,                              // 是否错误
  content: [{ type: 'text', text: '指令' }],   // AI 可见的指令文本
  structuredContent: { ... },                   // AI 可见的业务数据
  _meta: { ... }                                // AI 不可见的渲染数据（如图片 URL）
}
```

## utils/util.js

工具函数文件需包含：

```javascript
// 预览模式开关（所有 Skill 统一 key）
const PREVIEW_MODE_KEY = 'mp_skills_preview_mode'

function isPreviewMode() {
  return wx.getStorageSync(PREVIEW_MODE_KEY) !== false   // 默认预览模式
}

function successResult(msg, structuredContent, meta) { ... }
function errorResult(msg) { ... }

module.exports = { isPreviewMode, successResult, errorResult, ... }
```

### 预览模式管理

用户通过以下方式切换模式：

```javascript
// 开启预览模式（默认）
wx.setStorageSync('mp_skills_preview_mode', true)

// 开启正式模式
wx.setStorageSync('mp_skills_preview_mode', false)
```

## 组件实现

每个组件是标准的微信小程序 Component，遵循四件套规范（index.js/json/wxml/wxss）：

```javascript
// components/my-card/index.js
Component({
  data: { /* 渲染数据 */ },
  lifetimes: {
    created() {
      this._modelCtx = wx.modelContext.getContext(this)
      this._modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const sc = (data && data.result && data.result.structuredContent) || {}
        const meta = (data && data.result && data.result._meta) || {}
        this.setData({ ...sc, ...meta })
      })
    }
  },
  methods: {
    onTapItem(e) {
      this._modelCtx.sendFollowUpMessage({
        content: [
          { type: 'text', text: '选择某项目' },
          { type: 'api/call', data: { name: 'nextApi', arguments: { ... } } }
        ]
      })
    }
  }
})
```

### 组件事件通信

| 方向 | 方式 | 说明 |
|------|------|------|
| 接收数据 | `NotificationType.Result` | 监听 API 返回结果 |
| 触发 API | `sendFollowUpMessage({ type: 'api/call' })` | 上行触发下一个 API |
| 发送文本 | `sendFollowUpMessage({ type: 'text' })` | 给 AI 提供上下文 |
| 打开页面 | `viewCtx.openDetailPage()` | 打开半屏详情页 |

## 云函数

每个 Skill 最多一个云函数，独立部署：

```javascript
// cloudfunctions/my-skill-handler/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

async function handleMyAction(event) { ... }

exports.main = async (event) => {
  const { action } = event
  switch (action) {
    case 'myAction': return handleMyAction(event)
    default: return { code: -1, message: `未知 action: ${action}` }
  }
}
```

```json
// cloudfunctions/my-skill-handler/package.json
{
  "name": "my-skill-handler",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": { "wx-server-sdk": "latest" }
}
```

## 数据库定义

```json
// database/collections.json
{
  "collections": [
    {
      "name": "my_collection",
      "description": "说明",
      "indexes": [
        { "name": "idx_field", "field": "field" }
      ]
    }
  ]
}
```

## 注册入口

```javascript
// index.js
function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/my-skill')
  skill.registerAPI('myApi', require('./apis/myApi'))
}
registerAPIs()
```

## 双模式总结

| | 预览模式 | 正式模式 |
|---|---------|---------|
| `mp_skills_preview_mode` | `true`（默认） | `false` |
| 云函数 | 不调用 | 调用独立云函数 |
| 数据库 | 不连接 | 连接云数据库 |
| 数据来源 | `data/seed.js` + 本地 storage | 云函数返回 |
| 适用场景 | 开发调试、Demo 展示 | 生产发布 |

## 安全规范（云开发）

### 身份认证

云开发自动注入用户身份，**小程序端无需登录，也不应传递 openid**。

```javascript
// 错误：客户端传 openid（AI 可能伪造）
const { result } = await wx.cloud.callFunction({
  name: 'my-handler',
  data: { action: 'doSomething', openid: getOpenid() }    // ❌
})

// 正确：云函数自取，客户端不传
const { result } = await wx.cloud.callFunction({
  name: 'my-handler',
  data: { action: 'doSomething' }                          // ✅
})
```

云函数端：

```javascript
exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const uid = wxContext.OPENID  // ✅ 自动获取当前用户身份
  // 不使用 event.openid（AI 生成的参数不可信任）
}
```

### 越权校验

写入数据库时必须带上 `_openid` 做所有权校验，防止用户操作他人数据：

```javascript
// 创建时记录 _openid
await db.collection('records').add({
  data: { _openid: uid, title, ... }
})

// 查询/修改时带上 _openid 条件
await db.collection('records')
  .where({ _id: recordId, _openid: uid })   // ✅ 只能操作自己的数据
  .update({ data: { status: 'done' } })
```

### 写操作必须通过云函数

增、删、改一律通过云函数落库，禁止客户端直连数据库写入：

```javascript
// ❌ 错误：客户端直接写数据库
wx.cloud.database().collection('records').add({ data: {...} })

// ✅ 正确：通过云函数
wx.cloud.callFunction({ name: 'my-handler', data: { action: 'create', ... } })
```

### 只读直连需安全规则

客户端直查数据库（如 `wx.cloud.database().collection('items').get()`）必须在云开发控制台设置安全规则：

```
// 安全规则：仅允许访问自己的数据
auth.openid == doc._openid
```

### 密钥管理

三方密钥等敏感信息放在云函数环境变量中，不写入小程序端代码或接口返回值。

## 开发工具

```bash
# 静态校验
node ~/.codebuddy/skills/wxa-skills-validate/scripts/validate.mjs <project-path>

# 原子接口执行测试
node ~/.codebuddy/skills/wxa-skills-validate/scripts/execute.mjs --project <project-path> --name <api-name>

# 原子组件渲染测试
node ~/.codebuddy/skills/wxa-skills-validate/scripts/render.mjs --project <project-path> --name <api-name>
```
