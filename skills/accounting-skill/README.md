# accounting-skill 智能记账本

> 基于微信小程序 AI 开发模式 + 微信云开发的智能记账 Skill

## 功能概述

用户通过自然语言与 AI 对话即可完成记账操作，无需手动填写表单：

- 📝 **智能记账**：说出"午餐花了35"，AI 自动提取金额、分类、备注并记录
- 📋 **账单查询**：查看今日/本周/本月的收支明细
- 📊 **统计分析**：按分类/时间段查看消费趋势和占比
- 🗑️ **删除记录**：撤销错误的记账记录
- 🎯 **预算管理**：设置月度总预算或分类预算，超支提醒

## 快速上手

### 1. 前置条件

- 微信开发者工具（Nightly 最新版）
- 已开通微信云开发环境
- 已开启小程序 AI 能力

### 2. 配置

编辑 `config.js`，填入云开发环境 ID：

```javascript
module.exports = {
  functionName: 'accounting-handler',
  envId: 'your-env-id'  // 替换为你的云开发环境 ID
}
```

### 3. 部署云函数

```bash
# 使用 mp-skills CLI 初始化
mp-skills plugin --name cloudbase setup

# 或手动部署
tcb fn deploy accounting-handler
```

### 4. 创建数据库集合

在云开发控制台创建以下集合：
- `accounting_records` - 记账记录
- `accounting_budgets` - 预算设置

## 目录结构

```
accounting-skill/
├── SKILL.md                          # AI 路由元数据
├── mcp.json                          # API + 组件声明
├── index.js                          # 注册入口
├── config.js                         # 配置文件
├── mp-skills.json                    # 插件配置
├── cloudbaserc.json                  # 云资源声明
├── README.md                         # 说明文档
├── apis/                             # 原子接口
│   ├── addRecord.js                  # 记账
│   ├── getRecords.js                 # 查询账单
│   ├── getStatistics.js              # 统计分析
│   ├── deleteRecord.js               # 删除记录
│   └── setBudget.js                  # 设置预算
├── components/                       # 原子组件
│   ├── record-card/                  # 记账结果卡片
│   ├── record-list-card/             # 账单列表卡片
│   ├── statistics-card/              # 统计报表卡片
│   └── budget-card/                  # 预算设置卡片
├── cloudfunctions/                   # 云函数
│   └── accounting-handler/           # 记账处理函数
│       ├── index.js
│       └── package.json
└── utils/                            # 工具函数
    ├── util.js                       # 通用工具
    └── storage.js                    # 本地存储管理
```

## 使用示例

### 记账

```
用户：午餐花了35
AI：已记录支出 35.00 元（餐饮）[展示记账结果卡片]

用户：收到工资8000
AI：已记录收入 8000.00 元（工资）[展示记账结果卡片]

用户：昨天打车花了15块
AI：已记录支出 15.00 元（交通）[展示记账结果卡片]
```

### 查账

```
用户：今天花了多少
AI：[展示今日账单列表卡片]

用户：看看这个月的账单
AI：[展示本月账单列表卡片]
```

### 统计

```
用户：这个月消费统计
AI：[展示统计报表卡片，含分类占比和趋势]

用户：餐饮花了多少
AI：[展示餐饮分类的统计卡片]
```

### 预算

```
用户：设置餐饮预算2000
AI：已设置 2025-06 餐饮预算 2000.00 元 [展示预算卡片]
```

## 分类体系

### 支出分类
餐饮、交通、购物、娱乐、居住、医疗、教育、通讯、其他

### 收入分类
工资、兼职、投资、红包、退款、其他

## 双模式运行

| | 预览模式（默认） | 正式模式 |
|---|---------|---------|
| 数据存储 | 本地 Storage | 云数据库 |
| 云函数 | 不调用 | 调用 accounting-handler |
| 适用场景 | 开发调试、Demo | 生产发布 |

切换方式：
```javascript
// 开启正式模式
wx.setStorageSync('mp_skills_preview_mode', false)

// 恢复预览模式
wx.setStorageSync('mp_skills_preview_mode', true)
```

## 安全设计

- 用户 openid 由云函数自动获取，前端不传递
- 所有写操作通过云函数执行
- 数据库查询带 `_openid` 条件，用户只能访问自己的数据
- 金额使用整数（分）存储，避免浮点精度问题

## 技术架构

```
用户 AI 对话
    ↓
原子接口（APIs）
    ↓ isPreviewMode?
    ├─ Yes → 本地 Storage 读写
    └─ No  → wx.cloud.callFunction
                ↓
          accounting-handler（云函数）
                ↓
          云数据库（accounting_records / accounting_budgets）
```
