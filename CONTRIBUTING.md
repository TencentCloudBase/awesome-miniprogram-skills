# 贡献指南

感谢你考虑为这个 Skill 集合做贡献！这里记录了贡献规范。

## 如何提交一个 Skill

### 1. Fork 仓库

点击 GitHub 上的 Fork 按钮，将仓库复制到你的账号下。

### 2. 创建 Skill 目录

在 `skills/` 下创建你的 Skill 目录，名称使用 `kebab-case`（如 `my-skill`）。

一个 Skill 至少包含以下文件：

```
skills/my-skill/
├── SKILL.md                     # AI 路由元数据（必须）
├── mcp.json                     # API + 组件声明（必须）
├── index.js                     # 注册入口（必须）
├── apis/                        # 原子接口实现（必须）
│   └── myApi.js
├── components/                  # 原子组件（必须）
│   └── my-card/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── data/seed.js                 # 种子数据（推荐）
├── utils/                       # 工具函数（可选）
├── README.md                    # Skill 说明（推荐）
└── screenshot.png               # 组件截图（推荐）
```

### 3. 可选：后端资源

如果 Skill 需要后端支持，可以包含：

```
skills/my-skill/
├── cloudfunctions/              # 云函数（最多一个）
│   └── my-skill-handler/
│       ├── index.js
│       └── package.json
└── database/                    # 数据库集合定义
    └── collections.json
```

- 每个 Skill 最多一个云函数，命名使用 `{skill-name}-handler`
- `database/collections.json` 声明本 Skill 需要的集合和索引

### 4. 注册到 app.json

在 `app.json` 的 `agent.skills[]` 中添加你的 Skill：

```json
{
  "name": "my-skill",
  "description": "简短描述",
  "path": "skills/my-skill"
}
```

### 5. 提交 PR

创建 Pull Request，标题格式：`feat: add <skill-name> skill`

PR 描述中包含：
- Skill 功能说明
- 截图（可选但推荐）
- 后端依赖说明（如果有）

## 代码规范

### SKILL.md

- 必须包含 YAML frontmatter（name, description, version, tags, platform）
- 描述接口链路和使用顺序
- 标注不适用场景

### mcp.json

- `apis[].name` 必须与 `index.js` 中 `registerAPI` 的名称一致
- `apis[].description` 需包含调用前置条件和禁止场景
- `apis[]._meta.ui.componentPath` 绑定对应的组件

### API 实现

- 每个 API 必须是 async function
- 返回 `{ isError, content, structuredContent, _meta }` 格式
- 优先尝试云函数调用，失败时降级到 seed mock 数据

### 组件

- 必须包含 `index.js` + `index.json` + `index.wxml` + `index.wxss`
- 通过 `wx.modelContext.getContext(this)` 获取上下文
- 监听 `NotificationType.Result` 接收数据
- 通过 `sendFollowUpMessage` 发送 `api/call` 消息

## 验证

提交前运行以下命令验证你的 Skill：

```bash
# 静态校验
node <validate-path>/scripts/validate.mjs <project-path>

# 原子接口执行
node <validate-path>/scripts/execute.mjs --project <project-path> --name <api-name>

# 原子组件渲染
node <validate-path>/scripts/render.mjs --project <project-path> --name <api-name>
```

## 许可证

本项目采用 MIT 许可证。提交代码即表示你同意在相同许可证下发布。
