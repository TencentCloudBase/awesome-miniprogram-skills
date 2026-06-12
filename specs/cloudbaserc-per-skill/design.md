# Skill 级 cloudbaserc.json 方案

## 问题背景

当前使用 `tcb fn deploy` 部署 Skill 云函数时存在以下问题：

1. **CLI 自动推测不准确**：`tcb fn deploy image-gen-handler --yes` 推测入口函数为 `.eslint.main`（实际应为 `index.main`），超时时间仅 15s（AI 图片生成需要 120s）
2. **数据库集合定义分散**：集合在 `skills/*/database/collections.json` 中定义，与云函数配置分离，部署时需要分别操作
3. **缺少统一配置层**：Skill 的云资源配置散落在 `package.json`、`collections.json` 和代码注释中，无法被 CLI/MCP 工具直接消费

## 方案目标

让每个 Skill 通过一份 `cloudbaserc.json` 声明所有云资源依赖，`mp-skills setup` 时自动合并到外层 `cloudbaserc.json`，使 `tcb fn deploy` 和 MCP 工具能直接使用准确配置。

## 设计

### 1. 分层配置模型

```
项目根/
├── cloudbaserc.json          ← 合并后（自动生成，可手动编辑）
├── skills/
│   ├── order-skill/
│   │   ├── SKILL.md
│   │   ├── cloudbaserc.json  ← Skill 级声明（新增）
│   │   ├── cloudfunctions/
│   │   │   └── order-skill-handler/
│   │   │       ├── index.js
│   │   │       └── package.json
│   │   └── database/
│   │       └── collections.json  ← 数据库声明（继续保留，合并时读取）
│   └── ...
```

### 2. Skill 级 cloudbaserc.json 格式

```jsonc
// skills/order-skill/cloudbaserc.json
{
  "version": "2.0",
  "functions": [
    {
      "name": "order-skill-handler",
      "type": "event",             // "event" | "http"（对应 tcb fn deploy --httpFn）
      "timeout": 30,
      "runtime": "Nodejs18.15",
      "handler": "index.main",
      "memorySize": 256,
      "installDependency": true,
      "dir": "cloudfunctions/order-skill-handler",
      "envVariables": {},
      "triggers": [],               // 可选：timer 触发器
      "ignore": ["node_modules", ".git"]
    }
  ],

  // ⚠️ 以下为 CloudBase 扩展字段，不属于 tcb CLI 官方 schema
  // tcb CLI 会忽略此字段，由 mp-skills setup / MCP 工具消费
  "database": {
    "collections": [
      {
        "name": "orders",
        "description": "外卖订单集合",
        "indexes": [
          { "field": "openid", "unique": false },
          { "field": "status", "unique": false }
        ]
      }
    ]
  }
}
```

**格式说明**：
- `functions[]` 部分严格遵循官方 `cloudbaserc.json` schema：[官方文档](https://docs.cloudbase.net/cli-v1/config)
- `version: "2.0"` 启用动态变量语法（`{{env.XXX}}`、`{{tcb.envId}}`）
- `type: "http"` 时为 HTTP 云函数，`type: "event"` 或不填为 Event 函数
- `database` 为扩展字段，不在官方 schema 中，`tcb` CLI 会忽略它

### 3. 合并到项目级 cloudbaserc.json

`mp-skills setup` 将各 Skill 配置合并为项目级 `cloudbaserc.json`：

```jsonc
// 项目根/cloudbaserc.json（合并结果）
{
  "$schema": "https://static.cloudbase.net/cli/cloudbaserc.schema.json",
  "version": "2.0",
  "envId": "{{env.TCB_ENV_ID}}",
  "functionRoot": "./cloudfunctions",   // 聚合后的云函数目录

  "functions": [
    {
      "name": "order-skill-handler",
      "timeout": 30,
      "runtime": "Nodejs18.15",
      "handler": "index.main"
    },
    {
      "name": "image-gen-handler",
      "timeout": 120,                   // ← 关键：正确的超时配置
      "runtime": "Nodejs18.15",
      "handler": "index.main",
      "envVariables": {
        "MODEL": "hunyuan-2.0-image"
      }
    }
  ],

  // ⚠️ CloudBase 扩展字段，tcb CLI 忽略，MCP/mp-skills 消费
  "database": {
    "collections": [
      { "name": "orders", "description": "外卖订单集合", "skill": "order-skill" },
      { "name": "party_events", "description": "聚会活动集合", "skill": "party-skill" },
      { "name": "ai_image_history", "description": "AI 图片历史", "skill": "image-gen-skill" }
    ]
  }
}
```

**关键**：合并后的 `functions[]` 是 `tcb fn deploy` 的直接输入源，CLI 读取后不再需要推测 `handler`/`timeout`/`runtime` 等字段。

### 4. 合并策略

| 场景 | 策略 |
|------|------|
| 多 Skill 声明同名云函数 | 报错，提示冲突 |
| 多 Skill 声明同名数据库集合 | 合并 indexes（取并集），`skill` 字段追加 |
| 手动修改外层后重新合并 | diff 提示，**不覆盖手动修改的部分**（基于 `_generated` 标记区分） |
| Skill 被移除 | 对应的 functions/collections 条目提示清理 |

### 5. 数据库 collections.json 整合

现有 `database/collections.json` 继续保留作为源数据，合并时读取：当前 `mp-skills setup` 已经用 `scanCollections()` 扫描这些文件生成集合列表，合并到 `cloudbaserc.json` 的 `database.collections` 字段后，`tcb` CLI 和 MCP 可以直接依据它创建集合。

### 6. 部署流程改进

**现状**（依赖 CLI 自动推测，不准）：
```bash
tcb fn deploy image-gen-handler --yes
# 推测：入口 .eslint.main、超时 15s → ❌ 错误配置
```

**改进后**（读 cloudbaserc.json 精确部署）：
```bash
mp-skills setup                     # Step 1: 聚合云函数 + 合并 cloudbaserc.json
tcb fn deploy image-gen-handler     # Step 2: CLI 读取 cloudbaserc.json，准确部署
# 或者直接部署全部：
tcb fn deploy --all
```

**MCP 集成**：`manageFunctions` 的 `createFunction` 可以直接消费 `cloudbaserc.json`，逐个字段映射：

| cloudbaserc.json 字段 | `manageFunctions` 参数 | 含义 |
|------------------------|----------------------|------|
| `name` | `func.name` | 函数名 |
| `timeout` | `func.timeout` | 超时时间（秒） |
| `runtime` | `func.runtime` | 运行时 |
| `handler` | `func.handler` | 入口函数 |
| `memorySize` | `func` | 内存 |
| `type: "http"` | `func.type: "HTTP"` | HTTP 函数 |
| `envVariables` | `func.envVariables` | 环境变量 |
| `triggers` | `func.triggers` | 定时触发器 |
| `installDependency` | `func.isWaitInstall` | 云端安装依赖 |

### 7. 实施步骤

#### 7.1 mp-skills 工具侧（`/Users/bookerzhao/Projects/mp-skills`）

1. **`src/lib/cloudbase-config.ts`**（新增）— Skill 级 cloudbaserc.json 解析器
   - `parseSkillCloudbaserc(skillPath)` — 解析单个 Skill 的 cloudbaserc.json
   - `mergeToProjectConfig(projectPath, skills[])` — 合并所有 Skill 配置
   - `detectConflicts(configs[])` — 冲突检测
   
2. **`database-scanner.ts` 扩展** — 支持从 cloudbaserc.json 的 `database.collections` 读取，优先于 `collections.json`

3. **`setup.ts` 改造** — 部署时读取 Skill 级 cloudbaserc.json 中的 `timeout`/`runtime`/`handler`/`envVariables`，传递给部署命令

4. **`create.ts` 模板更新** — `skill-skeleton` 模板新增默认 `cloudbaserc.json`

5. **`new.ts` 模板更新** — 项目骨架 `cloudbaserc.json` 增加 `_generated` 元数据标记

#### 7.2 现有 Skill 侧（`awesome-miniprogram-skills`）

6. 为现有云函数 Skill 补充 `cloudbaserc.json`（以 image-gen 为例）：

```jsonc
// skills/image-gen-skill/cloudbaserc.json
{
  "version": "2.0",
  "functions": [
    {
      "name": "image-gen-handler",
      "type": "http",
      "timeout": 120,           // ← 关键：从 15s 修正为 120s
      "runtime": "Nodejs18.15",
      "handler": "index.main",  // ← 关键：从 .eslint.main 修正
      "memorySize": 512,
      "installDependency": true,
      "dir": "cloudfunctions/image-gen-handler"
    }
  ]
}
```

7. 统一配置源：原来 `cloudfunctions/*/cloudbaserc.json`（函数级）的配置上移到 Skill 级 `cloudbaserc.json`，`cloudfunction-scanner.ts` 的 `detectFunctionType()` 改为从 Skill 级读取

### 8. 工时估算

| 任务 | 预估 |
|------|------|
| `cloudbase-config.ts` 核心逻辑 | 1d |
| `setup.ts` 改造 + `database-scanner.ts` 适配 | 0.5d |
| `create.ts` / `new.ts` 模板更新 | 0.5d |
| `add.ts` / `remove.ts` 配置联动 | 0.5d |
| 冲突检测 + diff 提示 | 0.5d |
| 现有 Skill 补充 cloudbaserc.json | 1d |
| 测试 + 文档 | 0.5d |
| **合计** | **~4.5d** |

### 9. 后续扩展

- **MCP 工具直接读取**：CloudBase MCP 的 `manageFunctions` 读取合并后的 `cloudbaserc.json`，自动填入 timeout/runtime/handler 等参数
- **`mp-skills validate` 扩展**：校验 Skill 级 `cloudbaserc.json` 的字段合法性
- **一键部署**：`mp-skills setup --deploy` 直接调用 MCP 完成部署，无需手动 `tcb fn deploy`
