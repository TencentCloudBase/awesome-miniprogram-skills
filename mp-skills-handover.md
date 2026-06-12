# mp-skills CLI 交接文档

## 项目定位

`mp-skills` 是微信小程序 AI Skill 的 CLI 管理工具。用户通过它可以：
- 创建 AI 小程序项目（`mp-skills new`）
- 在已有项目中创建新 Skill 骨架（`mp-skills create`）
- 从远程仓库安装 Skill（`mp-skills add`）
- 移除、更新、搜索 Skill

仓库地址：<https://github.com/TencentCloudBase/mp-skills>

---

## 目录结构

```
mp-skills/
├── src/
│   ├── cli.ts                 # CLI 入口，命令路由
│   ├── commands/
│   │   ├── add.ts             # 安装 Skill（远程/本地）
│   │   ├── create.ts          # 在项目中创建 Skill 骨架
│   │   ├── new.ts             # 创建小程序项目
│   │   ├── remove.ts          # 移除 Skill
│   │   ├── list.ts            # 列出已安装/远程 Skill
│   │   ├── find.ts            # 搜索远程 Skill
│   │   ├── update.ts          # 更新 Skill
│   │   ├── validate.ts        # 静态校验
│   │   ├── execute.ts         # 执行原子接口
│   │   └── render.ts          # 渲染组件
│   ├── lib/
│   │   ├── telemetry.ts       # 遥测（Beacon）
│   │   ├── installer.ts       # Skill 安装逻辑
│   │   ├── git.ts             # Git 克隆/远程列表
│   │   ├── lock-file.ts       # skills-lock.json
│   │   ├── source-parser.ts   # 来源解析（GitHub/URL/本地）
│   │   ├── sanitize.ts        # 文件名清洗
│   │   ├── selector.ts        # 交互式选择器
│   │   └── utils.ts           # 日志/工具
│   └── registry.json          # 远程仓库注册表
├── templates/
│   ├── base/                  # `mp-skills new` 的项目骨架
│   │   ├── miniprogram/
│   │   │   ├── app.json       # 内置 greet-skill
│   │   │   ├── app.js         # 云开发初始化
│   │   │   ├── pages/index/   # 首页（调用 welcome-card）
│   │   │   └── skills/greet-skill/  # 内置欢迎 Skill
│   │   ├── cloudfunctions/
│   │   └── project.config.json
│   └── skill-skeleton/        # `mp-skills create` 的 Skill 模板
│       ├── mcp.json
│       ├── SKILL.md
│       ├── index.js
│       ├── apis/greet.js
│       └── components/greeting-card/
├── bin/
│   └── mp-skills.mjs          # CLI 启动入口
├── test/
│   ├── add.test.ts
│   ├── create.test.ts
│   ├── installer.test.ts
│   ├── lock-file.test.ts
│   ├── new.test.ts
│   ├── sanitize.test.ts
│   └── source-parser.test.ts
├── .github/workflows/
│   └── test.yml               # CI: typecheck → format → test
└── package.json
```

---

## 命令体系

| 命令 | 描述 | 实现文件 |
|------|------|---------|
| `mp-skills new <name>` | 创建新小程序项目 | `new.ts` |
| `mp-skills create [name]` | 在项目中创建 Skill 骨架 | `create.ts` |
| `mp-skills add <source>` | 安装 Skill（远程/本地） | `add.ts` |
| `mp-skills remove <name>` | 移除 Skill | `remove.ts` |
| `mp-skills list` | 列出已安装 Skill | `list.ts` |
| `mp-skills find [keyword]` | 搜索远程 Skill | `find.ts` |
| `mp-skills update [skills]` | 更新已安装 Skill | `update.ts` |
| `mp-skills validate` | 静态校验（需 IDE） | `validate.ts` |
| `mp-skills execute --name <api>` | 执行原子接口 | `execute.ts` |
| `mp-skills render --name <api>` | 渲染组件截图 | `render.ts` |

---

## 已完成的改进

### CLI 优化
1. **命令重命名** — `create` 改为新建 Skill，`new` 改为新建项目，移除 `init`
2. **`add` 交互选择器** — 不加 `--skill` 时模糊搜索多选安装
3. **所有命令都有遥测** — 通过 `cli.ts` 的 `track()` 包装器统一上报
4. **Skill 级别安装统计** — `add:install` 事件记录 `repo:skillName`
5. **去掉 `--list` 参数** — 被交互选择器取代

### 项目模板优化
1. **内置 `greet-skill`** — 创建项目自带欢迎 Skill，首页直接展示 welcome-card
2. **`project.config.json`** — 添加 `miniprogramRoot` 和 `appid: tourist`
3. **`app.js` 异常处理** — 云开发失败不阻塞，走预览模式
4. **创建后提示** — 提示用户配置 appid

### 发布流程（零依赖发布）

**已实现零依赖发布**（参考 vercel-labs/skills 的 obuild 方案）：
1. **esbuild 全量打包** — `scripts/build.mjs` 将源码 + 所有依赖（commander、enquirer、nanospinner 等）bundle 为单个 CJS 文件 `dist/cli.cjs`
2. **零 `dependencies`** — 8 个原运行时依赖全部移入 `devDependencies`，只 build 时需要
3. **`bin` 直指 bundle** — `"mp-skills": "./dist/cli.cjs"`，产物自带 `#!/usr/bin/env node` shebang
4. **`files` 最简** — 只发 `dist/cli.cjs`、`templates/`、`README.md`
5. **`import.meta.url` 兼容** — banner 注入 `__import_meta_url__` 变量 + esbuild define 替换，确保 `createRequire()` 和 `fileURLToPath()` 在 CJS 下正常工作
6. **`prepack`** — `npm publish` 前自动 build

**发布步骤**：
```bash
# 方式一：GitHub Actions（推荐）
# Actions → Publish → Run workflow → 选择 bump 类型
# CI 自动: build → bump version → push tag → npm publish --provenance → GitHub Release

# 方式二：手动
npm version patch          # 或 minor / major
npm publish                # prepack 自动跑 build
```

**安装体验**：
```bash
npm install -g mp-skills
# → 0 运行时依赖，秒级完成 ✅
# → 约 776KB gzipped，2.8MB 解压后
```

**前置条件**（一次性配置）：
1. 打开 npmjs.com → `mp-skills` package → Settings → Publishing access
2. 添加 Trusted Publisher：
   - GitHub repo: `TencentCloudBase/mp-skills`
   - Workflow path: `.github/workflows/publish.yml`
3. 无需任何 Secrets — OIDC 自动认证，`--provenance` 自动附加

---

## 当前状态与已知问题

### ✅ 已解决
- `subPackages.root` 路径错误（已改为相对 `miniprogram/` 的 `"skills"`）
- `project.config.json` 缺少 `miniprogramRoot`（已添加）
- 遥测只在 `find` 命令生效（已改为 wrapper 全命令上报）

### ⚠️ 待处理

**1. 类型检查失败（他人提交的新文件导致）**
- 文件：`src/lib/cloudbase.ts`、`src/lib/credential-setup.ts`、`src/lib/opencode.ts`、`src/commands/eval.ts`
- 依赖了 `@cloudbase/manager-node`、`enquirer`、`cli-table3`、`opencode-ai`
- 这些是私有包，当前 `package.json` 中列为 `dependencies` 但无法正常安装
- 责任人：binggg
- **建议**：CI 中暂时跳过这些文件的类型检查，或等待责任人修复

**2. esbuild 打包 + CJS/ESM 互操作** ✅ 已解决
- `commander` 使用 CJS `require('node:events')`，通过输出 `.cjs` 格式强制 CJS 模式解决
- `import.meta.url` 通过 banner 注入 `__import_meta_url__` + esbuild define 替换解决
- 已验证在 Node 22 上正常运行（`--help`、`--version`、子命令均通过）

**3. 缺少 lint-staged / husky**
- 每次推送前需手动跑 `npm run format:check && npm run typecheck && npm test`
- **建议**：添加 `husky` + `lint-staged`，提交前自动格式化

**4. 缺少自动化发布工作流** ✅ 已解决
- 新增 `.github/workflows/publish.yml`（参考 vercel-labs/skills）
- 手动触发（GitHub Actions → Publish → Run workflow），选择 patch/minor/major
- 自动 bump 版本 → push tag → npm publish --provenance → 创建 GitHub Release

**5. Beacon 遥测 AppKey 归属确认**
- 当前使用 `0WEB0AD0GM4PUUU1`
- 需确认该 key 是否在 Beacon 后台配置了 `mp_skills_command` 事件和所有参数
- 需确认 `detail` 字段是否在后台做了聚合统计

---

## 开发指南

### 本地开发
```bash
cd /path/to/mp-skills
npm install
npm run build              # esbuild bundle → dist/cli.cjs
npm link                   # 全局链接
mp-skills --help           # 测试链接
```

### 发布
```bash
# 零依赖发布：npm install -g mp-skills 无需下载任何 runtime 依赖
npm version patch          # 或 minor / major
npm publish                # prepack 自动跑 build
```

### 调试
```bash
# 查看 bundle 产物
node dist/cli.cjs --help
node dist/cli.cjs --version

# 查看 bundled 依赖列表
npx esbuild src/cli.ts --bundle --platform=node --metafile=meta.json
cat meta.json | node -e "const m=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(m);Object.keys(j.inputs).filter(k=>k.includes('node_modules')).forEach(k=>console.log(k))"

# 查看 beacon 遥测数据
MP_SKILLS_BEACON_URL=http://localhost:9999 node dist/cli.cjs add ...

# 验证零依赖发布（dependencies 应为空对象）
npm pack --dry-run
```

---

## 遥测数据结构

| eventCode | command | success | detail |
|-----------|---------|---------|--------|
| mp_skills_command | add | true/false | 来源字符串 |
| mp_skills_command | remove | true/false | 移除的 skill 名 |
| mp_skills_command | create | true/false | 创建的 skill 名 |
| mp_skills_command | new | true/false | 项目名 |
| mp_skills_command | find | true/false | 搜索关键词 |
| mp_skills_command | add:install | true | `repo:skillName` <-- 按此字段聚合统计安装量 |

---

## 相关资源

- 微信开发者工具 CLI 文档
- `awesome-miniprogram-skills` 仓库：<https://github.com/TencentCloudBase/awesome-miniprogram-skills>
- Beacon 后台：<https://beacon.tencent.com>

---

## 交接重点

1. **主开发分支**：`main`，直接 push
2. **项目负责人**：bookerzhao（发布 + 决策），binggg（部分新功能）
3. **核心代码在 `src/`**，所有命令入口在 `cli.ts`
4. **模板在 `templates/`**，修改模板后需更新对应测试
5. **CI 在 `.github/workflows/test.yml`**，跑 typecheck / format / test
6. **发布流程已简化**：esbuild bundle → npm publish
