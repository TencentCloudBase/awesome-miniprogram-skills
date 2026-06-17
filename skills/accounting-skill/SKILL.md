---
name: accounting-skill
description: 智能记账本 Skill：自然语言记账、收支查询、分类统计、预算管理、月度报表
version: "1.0.0"
tags: ["微信小程序", "记账", "财务管理", "AI开发模式"]
platform: ["wechat-miniprogram"]
---

# accounting-skill 智能记账场景

## 业务流程图

用户意图
  │
  ├─ 记一笔（"午餐花了35"）────→ addRecord → 记账结果卡片
  │
  ├─ 查看账单（"看看今天花了多少"）→ getRecords → 账单列表卡片
  │
  ├─ 分类统计（"这个月餐饮花了多少"）→ getStatistics → 统计报表卡片
  │
  ├─ 删除记录（"删掉刚才那笔"）──→ deleteRecord → 操作结果卡片
  │
  └─ 设置预算（"这个月餐饮预算2000"）→ setBudget → 预算设置卡片

> **addRecord 是最核心的接口**——AI 需要从自然语言中自动提取金额、分类、备注。
> **getStatistics 支持多维度统计**——按分类、按时间段、支出/收入对比。

## 原子接口依赖关系

| 接口 | 作用 | 组件 | 前置条件 |
|------|------|------|----------|
| addRecord | 记录一笔收入或支出 | record-card | 用户表达记账意图 |
| getRecords | 查询账单列表 | record-list-card | 用户想查看账单 |
| getStatistics | 分类统计和趋势分析 | statistics-card | 用户想了解消费概况 |
| deleteRecord | 删除一条记录 | record-card | 已有 recordId |
| setBudget | 设置月度分类预算 | budget-card | 用户表达预算管理意图 |

## 业务约束（跨接口铁律）

### 1. 输出形态
- 所有成功返回的接口（isError=false）且绑定了组件的，**必须展示卡片**，禁止以纯文本列出卡片中的详情数据。
- Agent 回复时可附加一句简短引导话术，但**禁止把金额、分类等以 markdown 列表形式展开**。

### 2. 金额处理
- 所有金额单位为**分**（如 1 元 = 100 分），前端展示时转换为元。
- AI 解析用户输入时需将元转换为分存储。
- 支出为正数，收入为正数，通过 type 字段区分（expense/income）。

### 3. 分类体系
- 支出分类：餐饮、交通、购物、娱乐、居住、医疗、教育、通讯、其他
- 收入分类：工资、兼职、投资、红包、退款、其他
- AI 需根据用户描述自动匹配最合适的分类

### 4. 时间处理
- 默认记账时间为当前时间
- 用户可指定时间（"昨天中午吃饭花了30"）
- 统计查询支持：今天、本周、本月、本年、自定义时间段

### 5. 安全约束
- `_openid` 由云函数从 `cloud.getWXContext()` 自动获取，前端不传递。
- 用户只能查看和操作自己的记账数据。
- 写操作必须通过云函数。

## 用户意图分流

### 直接意图（触发本 SKILL）
- "记一笔"、"帮我记账"
- "午餐花了35"、"打车花了15块"
- "收到工资8000"、"收到红包200"
- "今天花了多少"、"这个月消费多少"
- "看看我的账单"
- "餐饮花了多少"、"这个月交通费多少"
- "删掉刚才那笔"、"撤销上一条"
- "设置餐饮预算2000"、"这个月预算5000"
- "我的消费统计"、"本月报表"

### 意图分流规则
- 用户说出具体花费/收入描述 → `addRecord`（AI 提取金额+分类+备注）
- 用户说"记一笔" 但未给出具体信息 → 反问金额和用途
- 用户问"花了多少/消费/账单" → `getRecords`
- 用户问"统计/报表/占比" → `getStatistics`
- 用户说"删掉/撤销" → `deleteRecord`
- 用户说"预算/限额" → `setBudget`
- 用户表达歧义 → 先反问澄清，禁止猜测

## 数据库集合

### accounting_records
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 用户标识 |
| type | string | expense/income |
| amount | number | 金额（分） |
| category | string | 分类 |
| note | string | 备注 |
| date | string | 记账日期 YYYY-MM-DD |
| time | string | 记账时间 HH:mm |
| createdAt | number | 创建时间戳 |

### accounting_budgets
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | string | 自动生成 |
| _openid | string | 用户标识 |
| category | string | 分类 |
| amount | number | 预算金额（分） |
| month | string | 月份 YYYY-MM |
| createdAt | number | 创建时间戳 |
