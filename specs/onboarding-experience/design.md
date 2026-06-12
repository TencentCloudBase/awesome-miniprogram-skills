# 技术方案 — CLI 云开发环境自动化搭建

## 1. 概述

在 `mp-skills` CLI 中新增 `setup`、`status`、`doctor` 三个命令，帮助模板用户从零搭建云开发环境。

核心思路：**声明式 + 状态文件驱动**。每个 Skill 声明自己需要什么（云函数、数据库集合、服务），CLI 对照锁文件，增量执行。

## 2. 架构

```
mp-skills CLI
├── 现有命令: add, list, remove, create, new, validate...
├── 新增命令:
│   ├── setup      ← 一站式环境搭建
│   ├── status     ← 查看当前状态
│   └── doctor     ← 健康检查
│
├── 新增 lib:
│   ├── cloudfunction-scanner.ts   ← 扫描/聚合云函数
│   ├── database-scanner.ts        ← 扫描/合并数据库声明
│   └── lock-file.ts (扩展)        ← 增加部署状态字段
│
└── skills-lock.json (扩展)
    {
      "version": 2,
      "skills": [...],           // 已有
      "deployed": {               // 新增
        "cloudfunctions": [...],
        "collections": [...],
        "services": [...]
      },
      "lastSetup": "..."          // 新增
    }
```

## 3. 数据流

```
skills/
├── drink-skill/
│   ├── cloudfunctions/drink-skill-handler/
│   └── database/collections.json
├── image-gen-skill/
│   ├── cloudfunctions/image-gen-handler/
│   └── database/collections.json
└── payment-skill/
    └── cloudfunctions/pay-common/
        └── cloudbaserc.json  → "type": "HTTP"

                    ↓  CLI 扫描

┌─────────────────────────────────────┐
│  云函数清单                          │
│  drink-skill-handler      Event      │
│  image-gen-handler        Event      │
│  pay-common              HTTP ⚠️     │
├─────────────────────────────────────┤
│  数据库集合清单（合并去重）           │
│  drinks, orders, ai_image_history... │
├─────────────────────────────────────┤
│  服务依赖                            │
│  HTTP 访问服务（pay-common 需要）     │
│  AI 模型（text-gen/image-gen 需要）   │
│  云存储（image-gen 需要）             │
└─────────────────────────────────────┘

                    ↓  对照 skills-lock.json

┌──────────────────┐
│  增量 diff        │
│  + 新函数 ×2      │
│  - 无变化          │
│  ⚠️ 待操作 ×3     │
└──────────────────┘
```

## 4. 命令设计

### 4.1 `mp-skills setup`

一站式环境搭建。执行流程：

```
setup
├── Step 1: 聚合云函数
│   ├── 扫描 skills/*/cloudfunctions/*/
│   ├── 识别 Event / HTTP
│   ├── 复制到 cloudfunctions/
│   └── 输出部署命令
├── Step 2: 数据库
│   ├── 扫描 skills/*/database/collections.json
│   ├── 合并去重
│   ├── 调用 CloudBase API 创建集合
│   ├── 创建索引
│   └── 输出安全规则提示
├── Step 3: 服务检查
│   ├── HTTP 访问服务（有 HTTP 函数时需要）
│   ├── AI 模型（有 AI Skill 时需要）
│   └── 云存储（有图片生成时需要）
└── Step 4: 写入锁文件
```

选项：
- `--cloudfunctions`  只处理云函数
- `--database`        只处理数据库
- `--services`        只检查服务
- `--dry-run`         预览，不实际执行

### 4.2 `mp-skills status`

读锁文件，与当前 Skill 声明对比，输出差异表：

```
📊 项目状态

云函数 (2/3 已部署):
  ✅ drink-skill-handler
  ✅ image-gen-handler
  ❌ pay-common (HTTP) — 需用 tcb fn deploy 部署

数据库 (1/3 集合):
  ✅ drinks
  ❌ ai_image_history — 未创建
  ❌ orders — 未创建

服务:
  ⚠️ HTTP 访问服务 — 未开启
```

### 4.3 `mp-skills doctor`

实际调 CloudBase API 做健康检查（不同于 status 只看锁文件）：

```
🔍 健康检查

云函数联通性:
  ✅ drink-skill-handler
  ❌ image-gen-handler — FUNCTION_NOT_FOUND
  ⚠️ pay-common — 未开启 HTTP 访问服务

数据库:
  ✅ 连接正常

建议操作: mp-skills setup
```

## 5. 锁文件扩展

在现有 `skills-lock.json` 基础上增加 `deployed` 和 `lastSetup` 字段：

```typescript
interface LockFile {
  version: 2
  skills: LockEntry[]
  deployed?: {
    cloudfunctions: string[]
    collections: string[]
    services: string[]
  }
  lastSetup?: string  // ISO timestamp
}
```

## 6. 云函数扫描器 (`cloudfunction-scanner.ts`)

```typescript
interface CloudFunctionInfo {
  name: string           // 函数名
  skillName: string      // 所属 Skill
  type: 'event' | 'http' // 函数类型
  sourcePath: string     // 源路径 skills/xxx/cloudfunctions/xxx/
  hasCloudbaserc: boolean // 是否有 cloudbaserc.json
}

// 扫描所有 Skill 的云函数
scanCloudFunctions(projectPath: string): CloudFunctionInfo[]

// 聚合到 cloudfunctions/ 目录
aggregateCloudFunctions(projectPath: string, funcs: CloudFunctionInfo[]): void
```

HTTP 检测逻辑：
- 检查 `cloudbaserc.json` 中 `functions[0].type === "HTTP"`
- 检查 `index.js` 注释 `HTTP 云函数`

## 7. 数据库扫描器 (`database-scanner.ts`)

```typescript
interface CollectionInfo {
  name: string
  description: string
  indexes: Array<{ name: string; field: string }>
  skills: string[]  // 哪些 Skill 声明了这个集合
}

// 扫描并合并
scanCollections(projectPath: string): CollectionInfo[]

// 通过 CloudBase API 创建集合
createCollections(envId: string, collections: CollectionInfo[]): Promise<void>

// 创建索引
createIndexes(envId: string, collections: CollectionInfo[]): Promise<void>
```

## 8. 与现有 `add` 命令的集成

`add` 安装完成后，增加提示：

```
✅ 已安装 3 个 Skill

⚠️  检测到新的云开发依赖，建议运行:
   mp-skills setup
```

## 9. Provider 抽象 — 开源中立设计

mp-skills CLI 是开源中立的，不硬编码云开发。但云开发作为重要的首个 provider，获得一等支持。

### 部署渠道

每个 provider 支持多种部署渠道：

| 渠道 | Event 云函数 | HTTP 云函数 | 数据库 | 适合场景 |
|------|-------------|-------------|--------|----------|
| CloudBase CLI（`tcb`） | `tcb fn deploy <name> --yes` | `tcb fn deploy <name> --httpFn --yes` | 控制台手动 / `tcb db` | 本地开发、CI/CD |
| CloudBase MCP | `manageFunctions` | `manageFunctions` + `manageGateway` | `writeNoSqlDatabaseStructure` | **AI Agent 自动化** |
| 微信开发者工具 | 右键上传 | ❌ 不支持 | ❌ 不支持 | 首次体验 |

> MCP 渠道特别适合我们的 Agent 评测和生产场景——Agent 可直接调用 MCP 工具完成部署，无需用户在终端手动操作。

### 未来扩展

```
mp-skills setup
├── --provider cloudbase  (默认)
├── --provider supabase   (未来)
└── --provider generic    (纯提示模式)
```

CLI 输出格式统一，provider 差异只在部署命令和 API 调用上。

## 10. 与 `mp-skills` SDK 的关系

- CLI 负责**环境搭建**（云函数部署、数据库建表、服务开通）
- SDK 负责**运行时**（`translateError` 等工具函数）
- 两者独立演进，CLI 在 setup 阶段可提示安装 SDK

## 11. 实施计划

- [ ] 1. 扩展 `types.ts`，增加 `DeployedState`、`CloudFunctionInfo`、`CollectionInfo` 类型
- [ ] 2. 扩展 `lock-file.ts`，增加 `deployed` 字段读写
- [ ] 3. 实现 `cloudfunction-scanner.ts`
- [ ] 4. 实现 `database-scanner.ts`
- [ ] 5. 实现 `setup` 命令
- [ ] 6. 实现 `status` 命令
- [ ] 7. 实现 `doctor` 命令
- [ ] 8. 在 `cli.ts` 中注册新命令
- [ ] 9. `add` 命令安装后添加 setup 提示
