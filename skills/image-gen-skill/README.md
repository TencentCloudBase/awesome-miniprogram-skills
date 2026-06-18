# image-gen-skill

AI 图片生成：文生图、AI 绘画、商品图、插画生成，支持多种风格和尺寸。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s image-gen-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 文生图：根据文字描述生成图片
- 风格创作：写实、动漫、油画、水彩、素描等多种风格
- 商品图生成：产品展示图、商品主图
- 插画与创意绘画

## 用户输入示例

- "画一只在咖啡杯旁打盹的橘猫"
- "帮我生成一张北欧风格手工咖啡壶的产品展示图"
- "用水彩风格画一朵牡丹"
- "画一张赛博朋克风格的城市插画"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `generateImage` | 根据 prompt 生成图片，支持风格、尺寸、数量等参数 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/image-result-card/index` | AI 图片结果展示卡片（支持预览、重新生成、换风格） |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `image-gen-handler` |

## 技术说明

- 必须通过云函数调用（小程序 SDK 不支持图片生成）
- 生成后自动上传到云存储持久化（路径：`ai-images/{openid}/image-gen/`）
- 云函数使用 `@cloudbase/node-sdk` 的 `createImageModel("hunyuan-image")` 能力
- 图片下载使用 Node.js 内置 https 模块，无需额外依赖
- 组件遵循 WeCard 视觉基线
