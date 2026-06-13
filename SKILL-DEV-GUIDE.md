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
5. `cloudbaserc.json` — 云资源声明（云函数配置 + 数据库集合）
6. `cloudfunctions/` — 云函数代码
7. `database/` — 数据库集合定义
8. `index.js` — 注册入口
9. `README.md` — Skill 说明

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
├── cloudbaserc.json            # 云资源声明（有云函数或数据库时必须）
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
| Skill 目录 | kebab-case | `queue-skill`, `order-skill` |
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

### 云存储图片展示规范

云存储 fileID（`cloud://` 协议）**不能在 `<image>` 标签中直接展示**，必须先用 `wx.cloud.getTempFileURL()` 转换为 HTTP URL。

```javascript
// ❌ 错误：cloud:// fileID 无法在组件中展示
src: img.fileID || img.tempUrl || ''

// ✅ 正确：使用 wx.cloud.getTempFileURL() 转换
async function resolveImageUrl(fileID) {
  if (!fileID || fileID.startsWith('http')) return fileID
  try {
    const res = await wx.cloud.getTempFileURL({
      fileList: [fileID]
    })
    return res.fileList[0]?.tempFileURL || fileID
  } catch (e) {
    console.warn('[ai-mode] getTempFileURL failed:', e.message)
    return fileID
  }
}
```

**最佳实践**：在组件 `created` 中收到 `Result` 通知后，对图片数据做转换：

```javascript
// 组件 created 中
modelCtx.on(NotificationType.Result, async (data) => {
  const sc = (data && data.result && data.result.structuredContent) || {}
  const meta = (data && data.result && data.result._meta) || {}
  const rawImages = meta.images || sc.images || []

  // 转换 fileID → tempURL
  const fileIDs = rawImages.filter(img => img.fileID && !img.tempUrl).map(img => img.fileID)
  let urlMap = {}
  if (fileIDs.length > 0) {
    const res = await wx.cloud.getTempFileURL({ fileList: fileIDs })
    res.fileList.forEach(item => { urlMap[item.fileID] = item.tempFileURL })
  }

  const images = rawImages.map(img => ({
    ...img,
    src: img.tempUrl || urlMap[img.fileID] || ''
  }))
  this.setData({ images })
})
```

**转换时机选择**：

| 时机 | 优点 | 缺点 |
|------|------|------|
| 原子接口 API 中转换 | 组件侧无感 | API 返回变慢（需 await） |
| 组件 created 中转换 | 组件自治，API 快速返回 | 每个组件都要写一遍转换逻辑 |
| 中间件中转换 | 统一处理，一次搞定 | 需要数据标记才能知道哪些字段是 fileID |

推荐在**原子接口 API** 或**组件 created** 中转换，不建议在中间件中做（无法预知数据中哪些字段是 fileID）。

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

## cloudbaserc.json

每个包含云函数或数据库的 Skill 必须在根目录放置 `cloudbaserc.json`，声明云资源依赖。`mp-skills setup` 会将各 Skill 配置合并到项目级 `cloudbaserc.json`，供 `tcb fn deploy` 和 MCP 工具直接使用。

```jsonc
// skills/my-skill/cloudbaserc.json
{
  "version": "2.0",
  "functions": [
    {
      "name": "my-skill-handler",
      "type": "event",               // "event" 或 "http"
      "timeout": 30,                  // 单位：秒
      "runtime": "Nodejs18.15",
      "handler": "index.main",
      "memorySize": 256,
      "installDependency": true,
      "dir": "cloudfunctions/my-skill-handler",
      "envVariables": {},
      "triggers": [],                 // 可选：timer 触发器
      "ignore": ["node_modules", ".git"]
    }
  ],

  // ⚠️ CloudBase 扩展字段，tcb CLI 忽略，mp-skills / MCP 消费
  "database": {
    "collections": [
      {
        "name": "my_collection",
        "description": "集合说明",
        "indexes": [
          { "field": "openid", "unique": false },
          { "field": "status", "unique": false }
        ]
      }
    ]
  }
}
```

### 为什么需要 cloudbaserc.json

`tcb fn deploy` 在无配置文件时会自动推测参数，经常出错：

| 字段 | 无 cloudbaserc.json（推测） | 有 cloudbaserc.json（精确） |
|------|--------------------------|--------------------------|
| `handler` | `.eslint.main` ❌ | `index.main` ✅ |
| `timeout` | `15` ❌（AI 生成需要 120s+） | 按需配置 ✅ |
| `runtime` | 推测可能不准 | 精确指定 ✅ |
| `type` | 无法区分 HTTP/Event | 精确指定 ✅ |

### 关键字段说明

| 字段               | 必须 | 说明                                                        |
| ------------------ | ---- | ----------------------------------------------------------- |
| `name`             | ✅   | 云函数名，对应 `cloudfunctions/<name>/` 目录                |
| `type`             | ✅   | `"event"` = Event 函数，`"http"` = HTTP 函数                |
| `timeout`          | ✅   | 超时秒数，AI 类函数建议 60-120s                             |
| `runtime`          | ✅   | 运行时，推荐 `Nodejs18.15`                                  |
| `handler`          | ✅   | 入口函数，默认 `index.main`                                 |
| `envVariables`     | -    | 环境变量，敏感信息放这里不放代码                            |
| `triggers`         | -    | 定时触发器，7 段 cron 格式                                  |
| `database`         | -    | ⚠️ CloudBase 扩展，`collections.json` 的平替                |
| `database[].index` | -    | `{ "field": "字段名", "unique": false }` 格式               |

### 与 database/collections.json 的关系

两者二选一即可。如果 `cloudbaserc.json` 中声明了 `database.collections`，则优先使用；否则 `mp-skills setup` 回退读取 `database/collections.json`。

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

## 附录 A：WeCard 原子组件视觉基线

本项目所有新增或重构的原子组件，默认遵循 `WeCard Design System` 的微信风格基线。业务可替换少量品牌色，但不能破坏整体的克制、可信、易扫读特征。

### 设计目标

- 信息优先，避免营销海报感。
- 默认使用中性色建立层级，状态才使用功能色。
- 让卡片看起来像微信生态内的信息面板，而不是活动页素材。

### 基础 Token

#### Spacing

- `xs = 4px`
- `sm = 8px`
- `md = 12px`
- `lg = 16px`
- `xl = 24px`
- `2xl = 32px`

组件实现建议：

- 卡片默认内边距使用 `16px`
- 小块内容和辅助区块可使用 `12px`
- 同层信息默认垂直间距优先用 `8px`

#### Radius

- 普通卡片：`12px`
- 强调卡片：`16px`
- 图片圆角：`8px`
- 胶囊按钮：`999px`

说明：旧组件中如果大量使用 `4px` 或超大圆角，重构时优先收敛到本规范。

#### Light Color

```css
bg-page: #F5F5F7;
bg-card: #FFFFFF;
bg-soft: #F7F7F8;
bg-muted: #F2F2F7;

text-primary: #1D1D1F;
text-secondary: #6E6E73;
text-tertiary: #8E8E93;

border: #E5E5EA;
divider: #F0F0F0;
```

#### Dark Color

```css
bg-page: #111111;
bg-card: #1C1C1E;
text-primary: #FFFFFF;
text-secondary: rgba(255,255,255,.68);
border: rgba(255,255,255,.08);
```

#### Functional Color

- Success：`#12B76A`
- Danger：`#F04438`
- Warning：`#FF9F0A`
- Info：`#007AFF`

规则：默认灰，只有状态、趋势、风险才上色。

### Typography

- Display：`28 / 600`
- Title：`20 / 600`
- Subtitle：`16 / 500`
- Body：`14 / 400`
- Caption：`12 / 400`
- Tiny：`10 / 400`

规则：

- 不要全卡片大字号堆叠。
- 标题通常只保留一个 `20` 或 `17` 级主标题。
- 正文和元信息必须明显区分。

### 卡片结构

统一采用三段式：

```text
Header
Content
Footer
```

约束：

- Header 高度建议 `40~48px`
- Footer 操作数 `<= 3`
- 单张卡片只表达一个核心任务

### 按钮规范

- 高度：`40px`
- 最小宽度：`96px`
- 字号：`14px`
- 字重：`500`

主按钮：

```css
background: #2C2C2E;
color: #FFFFFF;
border-radius: 999px;
```

次按钮：

```css
background: #F2F2F7;
color: #1D1D1F;
border-radius: 999px;
```

幽灵按钮：

```css
background: transparent;
border: 1px solid #E5E5EA;
color: #1D1D1F;
border-radius: 999px;
```

### Tag 规范

- 高度：`20px`
- 水平内边距：`8px`
- 字号：`12px`
- 圆角：`10px`

默认 Tag：

```css
background: #F5F5F7;
color: #6E6E73;
```

状态 Tag 仅用于辅助，不可喧宾夺主。

### 图标与动效

- 图标尺寸优先使用 `16 / 20 / 24`
- 线宽控制在 `1.5~2`
- 动效只保留轻微反馈，不做夸张弹跳
- 按压反馈可使用 `scale(.98)` + `120ms`

### 落地规则

- 品牌色占比建议 `<= 5%`
- 不允许大面积渐变做卡片主背景
- 不允许用高饱和色同时承担标题、边框、按钮和标签
- 不允许为了“更精致”堆阴影和玻璃拟态
- 除营销半屏外，原子组件默认不做海报化设计

### 评审清单

- 这张卡片是否只表达一个任务？
- 是否可以在 3 秒内扫读完核心信息？
- 是否只用了必要颜色？
- 是否遵循 `8 / 12 / 16 / 24` 的留白节奏？
- 是否把操作数控制在 `3` 个以内？
- 是否更像微信生态里的信息面板，而不是活动页素材？
