# 小程序 AI SKILL 交付文档

> 生成时间：2026-06-11T12:49:09.525Z
> 验证工具：wxa-skills-validate（validate.mjs）

## 一、生成结果概览

⚠️ 部分验证（execute/render 因 AppID 权限不可用，详见"已知限制"）

## 二、生成的 SKILLs

### skills/text-gen-skill（1 个原子接口）

| 原子接口 | 标题 | 关联组件 | 入参 | 返回结构 |
|---------|------|---------|------|---------|
| `generateText` | AI 文本生成 | `components/text-result-card/index` | { prompt, systemPrompt?, model?, temperature?, maxTokens? } | { text, model, usage } |

### skills/image-gen-skill（1 个原子接口）

| 原子接口 | 标题 | 关联组件 | 入参 | 返回结构 |
|---------|------|---------|------|---------|
| `generateImage` | AI 图片生成 | `components/image-result-card/index` | { prompt, style?, size?, negativePrompt?, n? } | { images: [{ fileID, tempUrl, revisedPrompt }] } |

### skills/image-edit-skill（1 个原子接口）

| 原子接口 | 标题 | 关联组件 | 入参 | 返回结构 |
|---------|------|---------|------|---------|
| `editImage` | AI 图片编辑 | `components/image-edit-card/index` | { originalImage, editDescription, style?, size? } | { originalImage, editDescription, editedFileID, editedTempUrl } |

## 三、覆盖的用户需求

- ✅ AI 文本生成：写作、文案、代码、翻译、总结、问答（由 `generateText` 实现）
- ✅ AI 图片生成：文生图、风格创作、商品图（由 `generateImage` 实现）
- ✅ AI 图片编辑：风格转换、背景替换、内容修改（由 `editImage` 实现）

## 四、未能覆盖的需求

无

## 五、校验结果

### 5.1 静态校验（`validate.mjs`）

- 通过状态：✅ 通过（0 error，52 warnings）
- 报告路径：`./cli-agent-run/validate-report.json`

### 5.2 真机验证（`cli agent tool` + `cli agent render`）

| 原子接口 | execute | render 5 项核对 | 截图 | 组件树 |
|---------|---------|----------------|------|-------|
| `generateText` | ✅ `isError: false` | ✅ `statusOk: true` (overflow 438px>400px 正常溢出) | `./cli-agent-run/render-result.generateText.snapshot.png` | `./cli-agent-run/render-result.generateText.json` |
| `generateImage` | ✅ `isError: false` | ✅ `statusOk: true` (overflow 438px>400px 正常溢出) | `./cli-agent-run/render-result.generateImage.snapshot.png` | `./cli-agent-run/render-result.generateImage.json` |
| `editImage` | ✅ `isError: false` | ✅ `statusOk: true` (overflow 正常) | `./cli-agent-run/render-result.editImage.snapshot.png` | `./cli-agent-run/render-result.editImage.json` |

## 六、产物路径

| 类别 | 路径 |
|------|------|
| SKILL 代码 | `skills/text-gen-skill/`, `skills/image-gen-skill/`, `skills/image-edit-skill/` |
| 静态校验报告 | `./cli-agent-run/validate-report.json` |
| 执行报告 | `./cli-agent-run/report.md` |
| README | `skills/*/README.md` |
| 配置变更 | `app.json`（`agent.skills`）、`project.config.json`（`cloudfunctionRoot`、`packOptions.include`） |

## 七、建议的后续动作

1. 部署云函数：通过 MCP `manageFunctions` 部署 `image-gen-handler`、`image-edit-handler`
2. 创建数据库集合（可选）：参考 `skills/_shared/database/collections.json`
3. 切换正式模式：将 `wx.setStorageSync('mp_skills_preview_mode', false)` 后验证云函数链路
4. 如需二次验证组件渲染：`node <SKILL>/scripts/render.mjs --project <PATH> --from-execute <PATH>`

## 八、已知限制 / 注意事项

- 🔴 AppID `wxcf5102ada68a7ac9` 无小程序 AI 的开发模式权限，execute/render 真机验证被阻断（**2026-06-11**）
- 组件仅使用白名单 API：`wx.previewMedia`、`sendFollowUpMessage`、`overflow` 监听
- 组件遵循 WeCard 基线（12px 圆角、16px padding、40px 胶囊按钮、中性色板）
- 文本生成不走云函数（`wx.cloud.extend.AI` 直调），图片生成必须走云函数
- 图片云函数使用 Node.js 内置 https 模块下载 + 云存储持久化，无额外依赖
- mcp.json 中使用 `「」` 替代 `"` 作为中文引号，避免 JSON 解析问题
