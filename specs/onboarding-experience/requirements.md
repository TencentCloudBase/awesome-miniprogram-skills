# 需求文档 - 模板用户首次启动体验优化

## 介绍

当用户通过 CLI 工具拉取本模板后，在首次启动时会遇到多种因环境未配置导致的报错。当前错误信息为原始错误码/堆栈，对新手用户极不友好，需要投入较多排查成本。

本需求旨在对模板中所有云开发相关报错进行**统一拦截**，将技术错误码转换为可操作的友好提示，帮助用户快速定位问题并完成初始化。

## 需求

### 需求 1 - 云开发环境未初始化提示

**用户故事：** 用户拉取模板后直接打开小程序，尚未配置环境 ID 或未开通云开发，调用任何 Skill API 时收到报错。

#### 验收标准

1. When 用户调用任意 Skill API 且云开发环境未初始化时，the 系统 shall 返回友好提示：「请先在 app.js 中初始化云开发环境：`wx.cloud.init({ env: '你的环境ID' })`，环境 ID 可在[云开发控制台](https://tcb.cloud.tencent.com/dev)获取」。
2. When 云开发初始化失败（如 env ID 无效）时，the 系统 shall 提示：「云开发环境初始化失败，请检查环境 ID 是否正确。可在[控制台](https://tcb.cloud.tencent.com/dev)查看有效环境列表」。

### 需求 2 - 云函数未部署提示（FUNCTION_NOT_FOUND）

**用户故事：** 用户已配置好环境 ID，但尚未部署云函数，调用 API 时收到 `FUNCTION_NOT_FOUND` 等错误。

#### 验收标准

1. When `wx.cloud.callFunction` 返回 `errCode: -501000` 或 `FUNCTION_NOT_FOUND` 时，the 系统 shall 提示：「云函数「{函数名}」尚未部署，请执行 `bash scripts/setup-cloudfunctions.sh` 聚合云函数后，再使用 CloudBase CLI 或 MCP 工具进行部署」。
2. When 云函数调用返回 `errCode: -504002` 或 `FUNCTIONS_STATUS_ABNORMITY`（函数状态异常）时，the 系统 shall 提示：「云函数「{函数名}」状态异常（可能正在更新中），请稍后重试或前往[控制台](https://tcb.cloud.tencent.com/dev#/scf)检查」。
3. When 云函数调用返回 `errCode: -504003` 或 `FUNCTIONS_EXECUTE_FAIL`（函数执行超时/报错）时，the 系统 shall 提示：「云函数「{函数名}」执行出错，请前往[控制台 → 云函数日志](https://tcb.cloud.tencent.com/dev#/scf)查看详细错误信息」。
4. When 云函数调用返回其他通用错误时，the 系统 shall 提示：「云函数调用失败（{简要错误信息}），请检查云函数是否已正确部署。详情：{错误详情链接}」。

### 需求 3 - 云数据库未开通/权限错误提示

**用户故事：** 用户调用需要数据库的 Skill 时，数据库未开通或权限不足。

#### 验收标准

1. When 数据库操作返回 `errCode: -502001` 或 `DATABASE_NOT_EXIST`（数据库未开通）时，the 系统 shall 提示：「云数据库尚未开通，请前往[控制台 → 数据库](https://tcb.cloud.tencent.com/dev#/db)开通数据库服务」。
2. When 数据库操作返回 `errCode: -502002` 或 `DATABASE_COLLECTION_NOT_EXIST`（集合不存在）时，the 系统 shall 提示：「数据库集合「{集合名}」不存在，请确认云函数是否已正确部署（云函数首次调用时会自动创建集合），或前往控制台手动创建」。
3. When 数据库操作返回 `DATABASE_PERMISSION_DENIED` 或权限错误时，the 系统 shall 提示：「数据库权限不足。请前往[控制台 → 数据库 → 安全规则](https://tcb.cloud.tencent.com/dev#/db)检查集合权限配置，确保已设置正确的读写权限」。
4. When 数据库操作返回 `REQUEST_LIMIT_EXCEEDED` 或超出并发限制时，the 系统 shall 提示：「数据库请求过于频繁，请稍后重试」。

### 需求 4 - 云存储未开通/错误提示

**用户故事：** 用户调用需要云存储的 Skill（如图片生成/编辑）时，云存储未开通。

#### 验收标准

1. When 云存储操作返回 `STORAGE_NOT_EXIST` 或 `STORAGE_EXCEED_AUTHORITY` 时，the 系统 shall 提示：「云存储服务尚未开通或权限不足，请前往[控制台 → 存储](https://tcb.cloud.tencent.com/dev#/storage)开通并配置权限」。
2. When 云存储上传返回 `STORAGE_SIGN_ERROR` 或上传失败时，the 系统 shall 提示：「文件上传失败，请检查云存储服务状态」。

### 需求 5 - AI 模型未开通提示

**用户故事：** 用户使用 text-gen-skill 或 image-gen-skill，但未在控制台开启对应 AI 模型。

#### 验收标准

1. When `wx.cloud.extend.AI.createModel().generateText()` 返回模型不可用错误时，the 系统 shall 提示：「AI 模型尚未开启。请前往[控制台 → AI → 生文模型](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel)开启所需模型，并确保已购买 Token 资源包。」
2. When AI 图片生成返回模型不可用或额度不足时，the 系统 shall 提示：「图片生成失败。请检查：1. 是否已在[控制台](https://tcb.cloud.tencent.com/dev#/ai)开启生图模型；2. Token 资源包余额是否充足。」

### 需求 6 - Token 资源包余额不足提示

**用户故事：** 用户使用 AI 能力的额度已用完。

#### 验收标准

1. When AI 调用返回 `AI_MODEL_TOKEN_EXHAUSTED` 或 `FUNCTION_INSUFFICIENT_BALANCE`（预估的错误码）时，the 系统 shall 提示：「Token 资源包余额不足，请前往[控制台](https://tcb.cloud.tencent.com/dev#/ai)购买 Token 资源包。当前小程序成长计划提供 hy3-preview 模型免费额度。」
2. When AI 调用返回其他配额相关错误时，the 系统 shall 提示：「AI 服务调用受限（可能是额度不足或模型未开启），请前往控制台检查」。

### 需求 7 - CLI 工具下载后自动聚合云函数

**用户故事：** 用户通过 CLI 工具（`mp-skills`）拉取模板后，云函数散落在 `skills/*/cloudfunctions/` 目录下，需要手动聚合到根目录 `cloudfunctions/` 才能部署。

#### 验收标准

1. When CLI 工具完成模板下载后，the CLI shall 自动执行云函数聚合操作，将 `skills/*/cloudfunctions/*/` 下的云函数收集到项目根目录 `cloudfunctions/` 下。
2. When 聚合时发现同名云函数冲突时，the CLI shall 提示用户选择覆盖或跳过。
3. When 聚合完成后，the CLI shall 输出云函数列表和下一步部署指引。

### 需求 8 - 区分 Event 云函数与 HTTP 云函数的部署方式

**用户故事：** 模板中存在两种类型的云函数——Event 类型（绝大多数 Skill 使用）和 HTTP 类型（如 `pay-common`），前者可在微信开发者工具中上传部署，后者必须通过 CloudBase CLI 部署。用户不了解这一区别时会遇到部署失败。

#### 验收标准

1. When 聚合云函数时，the CLI shall 识别每个云函数的类型（通过 `cloudbaserc.json` 中的 `"type"` 字段或 `index.js` 注释标记），并在输出的函数列表中标注「Event」或「HTTP」。
2. When 提示部署指引时，the CLI shall 分别说明 Event 和 HTTP 云函数的部署方式：
   - Event 云函数：可在微信开发者工具中右键上传，或使用 `tcb fn deploy <name>` 部署
   - HTTP 云函数：必须使用 `tcb fn deploy <name>` 部署，且需在控制台开启 HTTP 访问服务
3. When 用户尝试在微信开发者工具中部署 HTTP 云函数失败时，the 系统 shall 提示：「「{函数名}」是 HTTP 云函数，无法在微信开发者工具中部署。请使用 CloudBase CLI：`tcb fn deploy {函数名}`，并在[控制台 → HTTP 访问服务](https://tcb.cloud.tencent.com/dev#/gateway)中开启访问」。

### 需求 9 - 数据库安全规则与索引自动配置

**用户故事：** 各 Skill 在 `database/collections.json` 中定义了所需的数据库集合和索引，但目前需要用户手动到控制台创建集合、配置索引和安全规则，步骤繁琐且易遗漏。

#### 验收标准

1. When CLI 工具完成模板下载后，the CLI shall 读取所有 `skills/*/database/collections.json` 中的集合定义，合并去重后生成一份统一的数据库初始化配置。
2. When 用户执行初始化命令（如 `tcb db init`）时，the CLI shall 自动创建所有声明过的集合。
3. When 集合创建完成后，the CLI shall 自动为每个集合创建 `collections.json` 中声明的索引。
4. When 集合创建完成后，the CLI shall 提示用户配置安全规则：「请在[控制台 → 数据库 → 安全规则](https://tcb.cloud.tencent.com/dev#/db)中为以下集合配置权限，推荐规则：仅创建者可写（`auth.openid == doc._openid`）」。安全规则模板应根据集合类型（公开只读/私有读写）自动推荐。
5. While 数据库尚未配置安全规则时，the 系统 shall 在启动时检查并提示用户配置（可选：首次启动执行一次校验）。

### 需求 10 - HTTP 访问服务配置检查

**用户故事：** HTTP 类型云函数（如 `pay-common`）通过 HTTP 访问服务对外暴露接口，如果未开通 HTTP 访问服务或未配置路由，会导致支付回调等功能不可用。

#### 验收标准

1. When 模板中包含 HTTP 云函数时，the CLI shall 在部署后提示：「该模板包含 HTTP 云函数「{函数名}」，请确认已在[控制台 → HTTP 访问服务](https://tcb.cloud.tencent.com/dev#/gateway)中开启服务并配置路由」。
2. When HTTP 访问服务返回 `FUNCTION_NOT_FOUND` 或 404 时，the 系统 shall 提示：「HTTP 云函数路由未配置或服务未开启，请前往[控制台](https://tcb.cloud.tencent.com/dev#/gateway)检查 HTTP 访问服务状态」。
3. When HTTP 访问服务返回 `FUNCTION_INVOCATION_FAILED` 或 500 时，the 系统 shall 提示：「HTTP 云函数执行出错，请前往控制台查看云函数日志」。

### 需求 11 - 统一错误拦截层

**用户故事：** 作为开发者，我需要一个统一的错误处理机制，避免在每个 Skill 中重复编写错误翻译逻辑。

#### 验收标准

1. When 项目启动时，the 系统 shall 初始化统一的云开发错误拦截器，劫持 `wx.cloud.callFunction`、`wx.cloud.database()` 等原生 API 的异常返回。
2. When 拦截到已知错误码时，the 系统 shall 自动替换为需求 1-6 中对应的友好提示。
3. When 拦截到未知错误码时，the 系统 shall 保留原始错误信息但附加排查建议链接。
4. 拦截器 shall 在预览模式下不生效（预览模式不涉及真实的云调用）。

**当前实现**：`skills/sdk/cloud-error-handler.js`，已接入 `image-gen-skill`、`image-edit-skill`、`text-gen-skill`。（参见需求 12 关于分发方式的讨论）

### 需求 12 - 公共运行时 SDK 随 Skill 自动分发

**用户故事：** 用户通过 CLI 单独下载某个 Skill 到自己的小程序项目时，Skill 依赖的公共运行时工具（如云开发错误拦截器 `cloud-error-handler`）不应因不在 Skill 目录内而丢失。

#### 背景

- 当前公共工具位于 `skills/sdk/cloud-error-handler.js`，作为临时实现
- 最终应收入 `mp-skills` npm 包，该包定位为「微信小程序 AI Skills 的运行时工具库」
- Skill 通过 npm 依赖 SDK，`require` 即可，无需关心文件路径
- 已评估的方案：
  - **`skills/sdk/` 目录附带**：临时方案，维护分散
  - **每个 Skill 复制一份**：维护成本高
- **选定方案**：收入 `mp-skills` npm 包，作为其导出之一

#### 验收标准

1. `mp-skills` npm 包新增导出 `translateError(err, funcName)`（是否拆子入口后续再定）。
2. Skill 内引用方式为 `const { translateError } = require('mp-skills')`，在 `catch` 块中直接调用，不包装 `wx.cloud.callFunction`。
3. When 云调用返回已知错误码时，`translateError` 返回友好提示文本。
4. When `mp-skills` 不可用或 Skill 未安装该依赖时，the Skill 的 fallback 降级为直接展示 `err.message`（不阻断业务流程，仅失去友好翻译）。

#### 与 SDK 目标架构的对齐

SDK 其他模块（`defineApi`、`defineComponent`、`defineAgent`、中间件系统）尚未实现，本次不强行融合。但设计上预留接口：

| 组件 | 当前形态 | SDK 落地后形态 |
|------|----------|----------------|
| `translateError(err, funcName)` | 纯函数，`mp-skills` 导出 | 不变 |
| `cloudError()` 中间件 | **暂不实现** | SDK 中间件系统落地后，作为内置中间件兜底自动调用 `translateError` |

**设计原则**：只做 `translateError` 一个原子能力，不包装 `wx.cloud.callFunction`。Skill 在 catch 中显式调用 `translateError` 即可，保持透明。

---

## 涉及的技术错误码清单

### 错误来源说明

小程序端云开发错误有两层：
1. **微信 SDK 层**：返回数值 `errCode`，格式如 `-501001`（参考[微信官方错误码](https://developers.weixin.qq.com/minigame/dev/wxcloud/reference/errcode.html)）
2. **CloudBase 后端层**：返回字符串错误码，格式如 `FUNCTION_NOT_FOUND`（参考[CloudBase 错误码文档](https://docs.cloudbase.net/error-code/basic)）

实际 `wx.cloud.callFunction` 的错误信息中两者会同时出现。拦截层需同时匹配**数值 errCode** 和 **字符串错误码**。

### 云函数错误

| 微信 errCode | CloudBase 错误码 | 场景 | 来源 |
|-------------|-------------------|------|------|
| `-501001` | `SYS_ERR` | 系统内部异常 | CloudBase |
| `-501002` | `SERVER_TIMEOUT` | 服务响应超时 | CloudBase |
| `-404011` | `FUNCTIONS_EXECUTE_FAIL` | 云函数执行失败（通用） | 微信 |
| - | `FUNCTION_NOT_FOUND` | 云函数未找到（未部署或名称错误） | CloudBase |
| - | `FUNCTIONS_STATUS_ABNORMITY` | 云函数状态异常（可能正在更新） | CloudBase |
| - | `FUNCTION_INVOCATION_FAILED` | 调用云函数超时或失败 | CloudBase |
| - | `FUNCTIONS_TIME_LIMIT_EXCEEDED` / `FUNCTION_TIME_LIMIT_EXCEEDED` | 云函数执行超时 | CloudBase |
| - | `FUNCTIONS_MEMORY_LIMIT_EXCEEDED` / `FUNCTION_MEMORY_LIMIT_EXCEEDED` | 云函数内存超限 | CloudBase |
| - | `FUNCTION_QUALIFIER_NOT_FOUND` | 指定版本不存在（HTTP 云函数路由） | CloudBase |
| - | `FUNCTION_EXCEED_RESOURCE_LIMIT` | 请求频率超过函数预置并发 | CloudBase |
| `-604101` | - | 云调用 API 权限不足 | 微信 |

### 数据库错误

| 微信 errCode | CloudBase 错误码 | 场景 | 来源 |
|-------------|-------------------|------|------|
| `-502001` | `DATABASE_REQUEST_FAILED` | 数据库请求失败（通用） | CloudBase |
| - | `DATABASE_PERMISSION_DENIED` | 无权限操作数据库资源（安全规则拦截） | CloudBase |
| `-502003` | - | 数据库操作未授权 | 微信 |
| - | `DATABASE_COLLECTION_NOT_EXIST` | 操作的集合不存在 | CloudBase |
| - | `DATABASE_COLLECTION_ALREADY_EXIST` | 集合已存在 | CloudBase |
| - | `DATABASE_COLLECTION_EXCEED_LIMIT` | 集合数量超限 | CloudBase |
| - | `DATABASE_TIMEOUT` | 数据库请求超时 | CloudBase |
| - | `DATABASE_DUPLICATE_WRITE` | 写数据库失败（索引键重复） | CloudBase |
| - | `DATABASE_TRANSACTION_FAIL` | 数据库事务请求失败 | CloudBase |
| `-501016` | `EXCEED_REQUEST_LIMIT` | 读写请求配额耗尽 | 微信/CloudBase |
| - | `EXCEED_RATELIMIT` | 请求频率超过套餐资源限制 | CloudBase |
| - | `EXCEED_CONCURRENT_REQUEST_LIMIT` | 请求并发超限 | CloudBase |

### 云存储错误

| 微信 errCode | CloudBase 错误码 | 场景 | 来源 |
|-------------|-------------------|------|------|
| `-503001` | `STORAGE_REQUEST_FAIL` | 云存储请求失败（通用） | CloudBase |
| `-503002` | `STORAGE_EXCEED_AUTHORITY` | 无权限操作云存储资源 | 微信/CloudBase |
| - | `STORAGE_FILE_NONEXIST` | 云存储文件不存在 | CloudBase |
| - | `STORAGE_FILE_PATH_CONFLICT` | 云存储文件路径冲突 | CloudBase |
| - | `STORAGE_SIGN_PARAM_INVALID` | 云存储文件元数据解析失败 | CloudBase |
| - | `EXCEED_UPLOAD_MAXFILESIZE` | 上传文件大小超限 | CloudBase |
| - | `CDN_SIGNATURE_MISSING` | 访问链接签名缺失 | CloudBase |
| - | `CDN_INVALID_SIGNATURE` | 访问链接签名不正确 | CloudBase |
| - | `CDN_SIGNATURE_EXPIRED` | 访问链接签名已过期 | CloudBase |

### AI 模型错误

| CloudBase 错误码 | 场景 | 来源 |
|-----------------|------|------|
| `AI_MODEL_NOT_FOUND` | 未找到指定模型分组 | CloudBase |
| `AI_MODEL_CONFIG_MISSING` | 缺少 API Key 等调用必要配置 | CloudBase |
| `AI_MODEL_DISABLED` | 模型已停用 | CloudBase |
| `AI_MODEL_NOT_SUPPORTED` | 不支持的具体模型 | CloudBase |
| `EXCEED_TOKEN_QUOTA_LIMIT` | Token 用量超出配额或分组额度不可用 | CloudBase |

### 环境与服务错误

| 微信 errCode | CloudBase 错误码 | 场景 | 来源 |
|-------------|-------------------|------|------|
| - | `INVALID_ENV` | 错误的环境、环境未找到 | CloudBase |
| - | `INVALID_ENV_STATUS` | 环境状态非法、不可用 | CloudBase |
| - | `ENV_ABNORMAL` | 环境状态异常 | CloudBase |
| - | `ENV_NOT_READY` | 环境资源尚未初始化完成 | CloudBase |
| - | `RESOURCE_NOT_INITIAL` | 云资源未初始化完成、不可用 | CloudBase |
| `-601001` | - | 微信系统错误 | 微信 |
| `-601011` | - | 无权限 | 微信 |
| `-606003` | - | 账户欠费 | 微信 |
| - | `HTTPSERVICE_NONACTIVATED` | 未开启 HTTP 访问服务 | CloudBase |
| - | `INVALID_PATH` | 未找到匹配的 HTTP 转发规则 | CloudBase |
| - | `SERVICE_CHARGE_OVERDUE` | 欠费停机（云托管） | CloudBase |
| - | `SERVICE_NOT_FOUND` | 未找到对应的云托管服务 | CloudBase |
| - | `DEFAULT_DOMAIN_EXPIRED` | 默认域名已过期 | CloudBase |
| `-501023` | `PERMISSION_DENIED` | 权限被拒绝（安全规则/单页模式） | 微信/CloudBase |

> **注意**：
> 1. 微信 errCode 来源于[微信官方文档](https://developers.weixin.qq.com/minigame/dev/wxcloud/reference/errcode.html)，CloudBase 错误码来源于[CloudBase 文档](https://docs.cloudbase.net/error-code/basic)
> 2. `DATABASE_REQUEST_FAILED`、`STORAGE_REQUEST_FAIL`、`FUNCTIONS_EXECUTE_FAIL` 为通用错误，未来会细化，不应基于它们做特殊逻辑判断
> 3. 实际 `wx.cloud.callFunction` 的 `errMsg` 中会同时包含两层错误信息，拦截层应同时匹配

---

### 需求 13 - CLI 状态文件

**用户故事：** 用户首次用 CLI 完成了环境搭建。后续又下载了新 Skill、或手动改了一些配置。再次运行时需要知道「上次做了什么」和「现在缺什么」，做到增量而非全量重来。

#### 验收标准

1. When CLI 完成首次环境搭建后，the CLI shall 在项目根目录生成 `mp-skills.lock` 状态文件，记录：已处理的 Skill 列表及版本、已部署的云函数、已创建的数据库集合、已开启的服务。
2. When CLI 再次运行时，the CLI shall 对比 `mp-skills.lock` 与当前项目实际状态，仅处理增量变更（新 Skill 的云函数、新声明的集合等）。
3. `mp-skills status` 命令 shall 输出当前状态：实际已部署 vs 期望部署的差异。
4. `mp-skills doctor` 命令 shall 执行全量健康检查：云函数是否可调用、数据库集合是否存在、安全规则是否配置。

**状态文件示例**（`mp-skills.lock`）：

```json
{
  "version": 1,
  "skills": {
    "image-gen-skill": "1.0.0",
    "text-gen-skill": "1.0.0"
  },
  "deployed": {
    "cloudfunctions": ["image-gen-handler", "text-gen-handler"],
    "collections": ["ai_image_history", "ai_text_history"],
    "services": ["ai-model", "storage"]
  },
  "lastSetup": "2026-06-12T10:00:00Z"
}
```

---

## 参考：模板涉及的云开发依赖清单

### 云函数（15 个）

| 云函数名 | 类型 | 所属 Skill | 部署方式 |
|----------|------|-----------|----------|
| `drink-skill-handler` | Event | drink-skill | 开发者工具 / CLI |
| `queue-skill-handler` | Event | queue-skill | 开发者工具 / CLI |
| `todolist-skill-handler` | Event | todolist-skill | 开发者工具 / CLI |
| `order-skill-handler` | Event | order-skill | 开发者工具 / CLI |
| `hospital-skill-handler` | Event | hospital-skill | 开发者工具 / CLI |
| `taxi-skill-handler` | Event | taxi-skill | 开发者工具 / CLI |
| `travel-skill-handler` | Event | travel-skill | 开发者工具 / CLI |
| `shopping-skill-handler` | Event | shopping-skill | 开发者工具 / CLI |
| `bill-skill-handler` | Event | bill-skill | 开发者工具 / CLI |
| `party-skill-handler` | Event | party-skill | 开发者工具 / CLI |
| `payment-handler` | Event | payment-skill | 开发者工具 / CLI |
| `pay-common` | **HTTP** | payment-skill | **仅 CLI** |
| `water-tracker-handler` | Event | water-tracker | 开发者工具 / CLI |
| `text-gen-handler` | Event | text-gen-skill | 开发者工具 / CLI |
| `image-gen-handler` | Event | image-gen-skill | 开发者工具 / CLI |
| `image-edit-handler` | Event | image-edit-skill | 开发者工具 / CLI |

### 数据库集合（14 个 Skill 声明了集合）

按 `database/collections.json` 定义，每个集合需：
1. 在控制台或 CLI 创建集合
2. 创建 `collections.json` 中声明的索引
3. 配置安全规则（推荐：`auth.openid == doc._openid`）

### 其他服务依赖

| 服务 | 用途 | 配置位置 |
|------|------|----------|
| AI 生文模型 | text-gen-skill | [控制台 → AI → 生文模型](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel) |
| AI 生图模型 | image-gen-skill | 控制台 → AI → 生图模型 |
| AI 图片编辑模型 | image-edit-skill | 控制台 → AI → 图片编辑模型 |
| HTTP 访问服务 | pay-common 的支付回调 | [控制台 → HTTP 访问服务](https://tcb.cloud.tencent.com/dev#/gateway) |
| 云存储 | AI 生成图片持久化 | [控制台 → 存储](https://tcb.cloud.tencent.com/dev#/storage) |
| Token 资源包 | 所有 AI 能力 | [控制台 → AI](https://tcb.cloud.tencent.com/dev#/ai) |
