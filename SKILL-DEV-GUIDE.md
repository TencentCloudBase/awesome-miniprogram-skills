# Skill 开发范式

本文档描述本项目的 Skill 开发规范。遵循这些规范可以保证 Skill 的一致性、可维护性和可部署性。

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

## 开发工具

```bash
# 静态校验
node <validate-path>/scripts/validate.mjs <project-path>

# 原子接口执行测试
node <validate-path>/scripts/execute.mjs --project <project-path> --name <api-name>

# 原子组件渲染测试
node <validate-path>/scripts/render.mjs --project <project-path> --name <api-name>
```
