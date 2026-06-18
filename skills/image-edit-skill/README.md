# image-edit-skill

AI 图片编辑：基于已有图片进行风格转换、背景替换、内容修改等编辑操作。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s image-edit-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 风格转换：将图片转换为写实、动漫、油画等风格
- 背景替换：更换图片背景
- 内容修改：在图片中添加或替换元素
- 扩图生成：将画面延伸扩展

## 用户输入示例

- "把这张图改成水墨画风格"
- "把背景换成白色"
- "把猫换成狗"
- "给画面加一些樱花飘落"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `editImage` | 基于原图和编辑需求，通过 AI 重绘实现图片编辑效果 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/image-edit-card/index` | 图片编辑结果展示卡片（原图与编辑后对比、预览、重新编辑） |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `image-edit-handler` |

## 技术说明

- 此为 AI 重绘实现的编辑，非像素级精确编辑
- 必须通过云函数调用，编辑后图片自动上传到云存储持久化
- 云函数使用 `@cloudbase/node-sdk` 的图片生成能力（基于 prompt engineering）
- 存储路径：`ai-images/{openid}/image-edit/`
- 组件遵循 WeCard 视觉基线
