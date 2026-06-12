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

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `generateText` | 根据 prompt 生成文本，支持 systemPrompt、temperature 参数 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/text-result-card/index` | AI 文本结果展示卡片 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `text-gen-handler`（仅 MCP 工具使用，小程序端直调 `wx.cloud.extend.AI`） |
| 依赖 | 小程序 SDK 自带 AI 能力，无需额外后端 |

## 技术说明

- 文本生成不走云函数，直接调用 `wx.cloud.extend.AI.createModel('cloudbase').generateText()`
- 默认模型为 `hy3-preview`（腾讯混元预览版），小程序成长计划可免费使用
- 如需更换模型，在代码中修改 `MODEL` 字段即可，不提供前端模型选择 UI

## 模型配置

### 前置条件

1. 已开通云开发环境，获取**环境 ID**（`ENV_ID`）
2. 已[购买 Token 资源包](https://docs.cloudbase.net/ai/model/model-access#token-%E8%B5%84%E6%BA%90%E5%8C%85)
3. 在[控制台 → AI → 生文模型](https://tcb.cloud.tencent.com/dev#/ai?tab=text-aiModel)中开启所需模型

### 如何更换默认模型

修改 `apis/generateText.js` 中的默认值：

```javascript
const { prompt, systemPrompt, model = 'hy3-preview', ... } = params
//                                   ^^^^^^^^^^^^ 改这里
```

### 可用模型列表

> **注意**：使用前需在控制台开启对应模型，并确保已购买 Token 资源包。

| 模型 ID | 提供商 |
|---------|--------|
| `hy3-preview`（**默认**） | 腾讯混元 |
| `deepseek-v4-flash-202605` | DeepSeek（原厂直供） |
| `deepseek-v4-pro-202606` | DeepSeek（原厂直供） |
| `deepseek-v4-flash` | DeepSeek |
| `deepseek-v4-pro` | DeepSeek |
| `deepseek-v3.2` | DeepSeek |
| `glm-5.1` | 智谱清言 |
| `glm-5v-turbo` | 智谱清言 |
| `glm-5-turbo` | 智谱清言 |
| `glm-5` | 智谱清言 |
| `kimi-k2.6` | Moonshot |
| `kimi-k2.5` | Moonshot |
| `minimax-m3` | MiniMax |
| `minimax-m2.7` | MiniMax |
| `minimax-m2.5` | MiniMax |
| `qwen3.5-flash` | 阿里 |
| `qwen3.5-plus` | 阿里 |

### 免费额度

小程序成长计划提供 `hy3-preview` 免费额度，建议优先使用默认模型。如需更高智能度的模型（如 `deepseek-v4-pro`、`glm-5` 等），评测等场景建议选用参数量较大的模型以获得更准确的评测效果。
