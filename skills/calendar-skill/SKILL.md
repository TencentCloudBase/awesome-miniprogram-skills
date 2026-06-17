---
name: calendar-skill
description: 智能日程提醒 Skill：自然语言创建日程，AI 自动解析时间地点，到期订阅消息提醒
version: "1.0.0"
tags: ["微信小程序", "日程", "提醒", "订阅消息", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# calendar-skill 智能日程提醒场景

## 业务流程图

```
用户意图
  │
  ├─ 创建日程（"下周三下午2点开会"）──→ addEvent → 日程创建卡片
  │
  ├─ 查看日程（"看看明天有什么安排"）──→ getEvents → 日程列表卡片
  │
  ├─ 修改日程（"把开会改到3点"）────→ updateEvent → 日程更新卡片
  │
  ├─ 删除日程（"取消明天的会议"）───→ deleteEvent → 操作结果卡片
  │
  └─ 订阅提醒（"提前15分钟提醒我"）─→ subscribeReminder → 提醒设置卡片
```

## 原子接口依赖关系

| API | 前置条件 | 输出组件 |
|-----|---------|---------|
| addEvent | 用户提供了时间信息和事件描述 | event-card |
| getEvents | 用户想查看日程安排 | event-list-card |
| updateEvent | 已有 eventId + 用户提出修改内容 | event-card |
| deleteEvent | 已有 eventId + 用户确认删除 | event-card |
| subscribeReminder | 已有 eventId + 用户授权订阅消息 | reminder-card |

## 业务约束

### 输出形态
- 创建/修改/删除日程后必须展示 event-card
- 查看日程列表展示 event-list-card
- 设置提醒展示 reminder-card

### 时间解析规则
- AI 从自然语言中解析出 startTime（开始时间）、endTime（结束时间，可选）
- **时区要求：所有时间必须输出为中国标准时间（UTC+8），使用带时区偏移的 ISO 8601 格式**
  - 正确格式示例：`2026-06-18T14:00:00+08:00`
  - 错误格式：`2026-06-18T06:00:00Z`（UTC）、`2026-06-18T14:00:00`（无时区标记）
- 支持相对时间："明天下午3点"、"下周三"、"后天上午10点"
- 支持绝对时间："6月20日14:00"、"2026-06-20 14:00"
- 当用户说"下午2点"时，指的是当地时间 14:00，应输出为 `T14:00:00+08:00`，而非 UTC
- 默认时长：如果未指定结束时间，默认1小时
- 提醒时间默认：开始前15分钟

### 日程分类
- 会议、工作、学习、运动、社交、就医、出行、生日、其他

### 订阅消息
- 使用小程序原生 wx.requestSubscribeMessage 请求用户授权
- 云函数定时触发器每5分钟扫描即将到期日程
- 通过云开发 cloud.openapi.subscribeMessage.send 推送订阅消息
- 每次提醒仅消耗一次订阅额度

### 安全约束
- 用户只能操作自己的日程（通过 openid 隔离）
- 不允许创建过去时间的日程（预览模式除外）

## 数据库集合

### calendar_events（日程表）
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 文档 ID |
| _openid | string | 用户标识 |
| eventId | string | 日程 ID |
| title | string | 日程标题 |
| description | string | 详细描述 |
| category | string | 分类 |
| location | string | 地点 |
| startTime | string | 开始时间 ISO 8601 |
| endTime | string | 结束时间 ISO 8601 |
| allDay | boolean | 是否全天 |
| remindBefore | number | 提前提醒分钟数 |
| subscribed | boolean | 是否已订阅提醒 |
| reminded | boolean | 是否已发送提醒 |
| status | string | active / cancelled |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

## 用户意图分流规则

| 用户表达 | 目标 API |
|---------|---------|
| "帮我建个日程"、"下周三开会"、"提醒我明天..."  | addEvent |
| "看看明天的安排"、"这周有什么日程"、"我的日程" | getEvents |
| "把会议改到3点"、"修改明天的日程" | updateEvent |
| "取消明天的会议"、"删掉这个日程" | deleteEvent |
| "提醒我"、"设置提醒"、"到时候通知我" | subscribeReminder |
