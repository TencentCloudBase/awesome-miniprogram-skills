# text-gen-skill

AI 文本生成：写作、文案、代码生成、翻译、总结、问答等纯文本生成场景。

## 新用户先读

如果你是第一次接触小程序 AI 开发模式，可以先理解这几个概念：

- **小程序 AI 开发模式**：微信小程序提供的 AI Agent 能力，允许用户用自然语言发起任务，小程序通过原子接口和原子组件完成业务动作与结果展示。
- **Skill**：一个可被 AI 调用的业务能力包，通常包含 `SKILL.md`、`mcp.json`、原子接口、原子组件，以及可选的云函数和数据库配置。
- **mp-skills**：小程序 AI Skill 的 CLI 工具，用于查找、安装、接入、校验和部署 Skill。

更多背景和完整接入说明见 [CloudBase 小程序 AI 解决方案](https://docs.cloudbase.net/solutions/wechat-miniprogram-ai/)，以及 [CloudBase 文档](https://docs.cloudbase.net/)。

## 安装到自己的小程序

在你自己的小程序项目根目录执行：

```bash
cd your-miniprogram
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s text-gen-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

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
