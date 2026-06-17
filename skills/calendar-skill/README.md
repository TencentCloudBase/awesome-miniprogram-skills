# 📅 calendar-skill 智能日程提醒

> 自然语言创建日程，AI 自动解析时间地点，到期通过微信订阅消息推送提醒

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🗣️ 自然语言创建日程 | 说「下周三下午2点开会」，AI 自动解析时间、地点、分类 |
| 📋 日程列表查看 | 查看今天/本周/任意时间段的日程安排，支持分页和分类筛选 |
| ✏️ 智能修改 | 说「把开会改到3点」即可增量修改指定字段 |
| 🗑️ 快速删除 | 说「取消明天的会议」，正式模式软删除，预览模式物理删除 |
| 🔔 订阅消息提醒 | 使用小程序原生订阅消息，到期前通过微信服务通知推送 |
| ⏰ 定时触发器 | 云函数每 5 分钟扫描即将到期日程，自动推送提醒 |
| 🌐 双模式运行 | 有云环境走云函数，无云环境自动切换本地 Storage 预览模式 |

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────────────┐
│  小程序端（AI Skill 框架）                                  │
├──────────────────────────────────────────────────────────┤
│  index.js            → createSkill + 注册 API + 中间件     │
│  mcp.json            → MCP 协议描述（API Schema + UI 映射） │
│  apis/               → 5 个原子 API 接口                   │
│  components/         → 3 个展示卡片组件                     │
│  utils/              → 工具函数 + 本地存储                   │
├──────────────────────────────────────────────────────────┤
│  云函数端                                                  │
├──────────────────────────────────────────────────────────┤
│  calendar-handler    → 日程 CRUD                          │
│                      → 订阅消息推送（openapi）              │
│                      → 定时触发器（每 5 分钟扫描）           │
├──────────────────────────────────────────────────────────┤
│  数据库                                                    │
├──────────────────────────────────────────────────────────┤
│  calendar_events     → 日程数据集合（7 个索引字段）          │
└──────────────────────────────────────────────────────────┘
```

## 📦 目录结构

```
calendar-skill/
├── index.js                    # Skill 入口，注册 API + 中间件
├── config.js                   # 配置文件（云环境ID、模板ID、超时）
├── mcp.json                    # MCP 协议描述（API Schema + 组件映射）
├── mp-skills.json              # 脚本配置（setup 命令）
├── cloudbaserc.json            # 云开发配置（云函数、数据库、触发器）
├── SKILL.md                    # Skill 业务文档
├── README.md                   # 本文件
├── apis/
│   ├── addEvent.js             # 创建日程
│   ├── getEvents.js            # 查询日程列表（支持分页/筛选）
│   ├── updateEvent.js          # 修改日程（增量更新）
│   ├── deleteEvent.js          # 删除日程（正式模式软删除）
│   └── subscribeReminder.js    # 订阅提醒（弹授权弹窗）
├── components/
│   ├── event-card/             # 日程结果卡片（创建/修改/删除后展示）
│   │   ├── index.js / .json / .wxml / .wxss
│   ├── event-list-card/        # 日程列表卡片（查询结果展示）
│   │   ├── index.js / .json / .wxml / .wxss
│   └── reminder-card/          # 提醒设置卡片（订阅状态展示）
│       ├── index.js / .json / .wxml / .wxss
├── cloudfunctions/
│   └── calendar-handler/       # 云函数
│       ├── index.js            # 入口（CRUD + 定时推送逻辑）
│       ├── package.json        # 依赖（wx-server-sdk latest）
│       └── config.json         # openapi 权限声明 + 定时触发器
└── utils/
    ├── util.js                 # 工具函数（时间解析/格式化/云调用）
    └── storage.js              # 本地存储管理（预览模式）
```

## 🚀 快速开始

### 1. 配置云环境

编辑 `config.js`，填入你的云开发环境 ID：

```javascript
module.exports = {
  functionName: 'calendar-handler',
  envId: '你的云环境ID',          // 留空则自动进入预览模式
  timeout: 15000,                 // 云函数调用超时时间（毫秒）
  subscribeTemplateId: '你的订阅消息模板ID'
}
```

### 2. 申请订阅消息模板

在小程序后台 → 功能 → 订阅消息 → 选用模板，选择**"预约通知"**（模板编号 30746），字段映射如下：

| 模板字段 | 编号 | 代码填入值 |
|---------|------|-----------|
| 预约内容 | `thing20` | 日程标题（≤20字） |
| 预约时间 | `time3` | 格式化时间（YYYY-MM-DD HH:mm） |
| 备注 | `thing6` | 地点/分类（≤20字） |

> 如果你选用了其他模板，需在 `cloudfunctions/calendar-handler/index.js` 的 `sendSubscribeMessage` 函数中修改对应的字段编号。

将模板 ID 填入 `config.js` 的 `subscribeTemplateId`。

### 3. 创建数据库集合

在云开发控制台创建集合 `calendar_events`，并添加以下索引字段：

| 索引字段 | 说明 |
|---------|------|
| `_openid` | 用户标识，数据隔离 |
| `startTime` | 开始时间，用于范围查询 |
| `endTime` | 结束时间 |
| `status` | 日程状态（active/cancelled） |
| `reminderTime` | 提醒触发时间 |
| `reminded` | 是否已提醒 |
| `createdAt` | 创建时间 |

> 也可使用 `mp-skills plugin --name cloudbase setup` 自动初始化。

### 4. 部署云函数

在微信开发者工具中，右键 `cloudfunctions/calendar-handler` 目录：

> ⚠️ **【重要】必须按以下顺序操作，否则定时触发器中的订阅消息推送会鉴权失败（INVALID_WX_ACCESS_TOKEN）：**
>
> **第一步：上传触发器**
> 右键云函数目录 → 点击 **「上传触发器」**
> （将 `config.json` 中的 triggers 配置同步到云端，赋予云函数定时触发的云调用鉴权能力）
>
> **第二步：上传并部署**
> 右键云函数目录 → 点击 **「上传并部署：云端安装依赖（不上传 node_modules）」**
> （部署最新代码，并在云端安装最新版 `wx-server-sdk`）

### 5. 定时触发器配置

触发器配置在 `config.json` 中：
```json
{
  "triggers": [
    {
      "name": "reminderTrigger",
      "type": "timer",
      "config": "0 */5 * * * * *"
    }
  ]
}
```

每 5 分钟自动触发一次，扫描即将到期的日程并推送订阅消息。

> ⚠️ **注意**：每次修改 `config.json` 中的 triggers 后，都必须重新执行「上传触发器」操作，否则云端不会更新触发规则。

## 📝 API 列表

| API | 说明 | 触发示例 | 展示组件 |
|-----|------|---------|---------|
| `addEvent` | 创建日程 | "下周三下午2点在公司开会" | event-card |
| `getEvents` | 查看日程 | "看看明天有什么安排" | event-list-card |
| `updateEvent` | 修改日程 | "把会议改到3点" | event-card |
| `deleteEvent` | 删除日程 | "取消明天的会议" | event-card |
| `subscribeReminder` | 订阅提醒 | "提前15分钟提醒我" | reminder-card |

### addEvent 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 日程标题 |
| `startTime` | string | ✅ | 开始时间（ISO 8601 + 时区偏移） |
| `endTime` | string | ❌ | 结束时间，默认开始时间后 1 小时 |
| `category` | string | ❌ | 分类，AI 自动推断，默认「其他」 |
| `location` | string | ❌ | 地点信息 |
| `description` | string | ❌ | 详细描述或备注 |
| `allDay` | boolean | ❌ | 是否全天日程，默认 false |
| `remindBefore` | number | ❌ | 提前提醒分钟数，默认 15 |

### getEvents 输入参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `startDate` | string | ❌ | 开始日期（YYYY-MM-DD），默认今天 |
| `endDate` | string | ❌ | 结束日期（YYYY-MM-DD），默认 7 天后 |
| `category` | string | ❌ | 筛选分类，不传则查所有 |
| `page` | number | ❌ | 页码，从 1 开始，默认 1 |
| `pageSize` | number | ❌ | 每页条数，默认 20 |

## 🔔 订阅消息流程

```
1. 用户创建日程 → addEvent 返回 eventId
2. 用户说「提醒我」→ subscribeReminder(eventId)
3. 弹出 wx.requestSubscribeMessage 授权弹窗
4. 用户同意 → 记录订阅状态 + templateId 到数据库
5. 定时触发器每 5 分钟扫描（event.Type === 'Timer'）
6. 查找：已订阅 & 未提醒 & 在提醒时间窗口内的日程
7. 调用 cloud.openapi.subscribeMessage.send 推送通知
8. 标记 reminded = true，避免重复推送
```

## 🎨 日程分类

会议 | 工作 | 学习 | 运动 | 社交 | 就医 | 出行 | 生日 | 其他

## 🕐 时区规则

- 所有时间字段使用用户本地时区（中国标准时间 UTC+8）
- 输出格式：带时区偏移的 ISO 8601，如 `2026-06-18T14:00:00+08:00`
- **禁止**使用 UTC（`Z` 后缀）或不带时区标记的格式

## ⚙️ 预览模式

当 `config.envId` 为空时，自动进入预览模式：
- 数据存储在小程序本地 Storage 中（key 前缀 `mp_skills_calendar_`）
- 所有 CRUD 操作均在本地完成，无需部署云函数
- 订阅消息授权弹窗正常弹出（但无法真正推送）
- 删除为物理删除（正式模式为软删除，status → cancelled）
- 适合开发调试和功能演示

## 🧩 MCP 协议

本 Skill 通过 `mcp.json` 定义 API Schema，AI 根据此描述自动：
- 匹配用户意图到对应 API
- 从自然语言中解析参数（时间、地点、分类等）
- 将结果渲染到指定组件（通过 `_meta.ui.componentPath`）

每个 API 描述中包含：
- **调用前置条件**：明确 AI 应在什么场景下调用
- **严禁场景**：防止 AI 误调用（如未确认 eventId 时禁止调用 update/delete）

## 📋 注意事项

- 订阅消息每次授权只消耗一次额度，到期后需要用户重新授权
- 定时触发器有最小 5 分钟间隔限制，提醒可能有最多 5 分钟延迟
- 用户数据通过 `_openid` 隔离，确保数据安全
- 不建议创建过去时间的日程（预览模式除外）
- 云函数运行环境：Node.js 18.15，256MB 内存，30s 超时
- 云函数依赖：`wx-server-sdk latest`（建议始终使用最新版，旧版本在定时触发器中可能出现鉴权失败）
