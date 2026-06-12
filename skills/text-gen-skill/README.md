# text-gen-skill

AI 文本生成：写作、文案、代码生成、翻译、总结、问答等纯文本生成场景。

## 功能

- AI 写作：公众号文章、小红书笔记、产品文案
- 代码生成：多种编程语言的代码片段
- 翻译：支持中英文互译
- 回答问题与内容总结

## 用户输入示例

- "帮我写一篇咖啡店介绍文案"
- "用 Python 写一个冒泡排序"
- "把这段话翻译成英文"
- "总结一下这篇文章的核心观点"
- "用 deepseek 模型帮我写一段代码"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `generateText` | 根据 prompt 生成文本，支持 systemPrompt、模型选择、temperature 参数 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/text-result-card/index` | AI 文本结果展示卡片（支持重新生成、换模型） |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `text-gen-handler`（仅 MCP 工具使用，小程序端直调 wx.cloud.extend.AI） |
| 依赖 | 小程序 SDK 自带 AI 能力，无需额外后端 |

## 技术说明

- 文本生成不走云函数，直接调用 `wx.cloud.extend.AI.createModel().generateText()`
- 支持三种模型：`cloudbase`（默认通用）、`deepseek-v4`（深度推理）、`hunyuan`（中文优化）
- 组件遵循 WeCard 视觉基线
