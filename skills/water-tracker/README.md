# water-tracker

喝水记录，支持记录每日饮水量、查看饮水历史和今日进度。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s water-tracker
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 记录本次喝水量，查看当天累计和目标进度
- 查看最近日期的饮水记录

## 用户输入示例

- "我刚喝了 250 毫升水，帮我记一下"
- "记录一杯 300ml 的水"
- "今天喝了多少水了"
- "看下我最近几天的喝水情况"
- "帮我回顾一下今天的饮水记录"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `addWaterRecord` | 记录一次喝水量 |
| `getWaterRecords` | 查询饮水记录 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/add-water-result/index` | 喝水记录结果卡片 |
| `components/water-records/index` | 饮水记录列表卡片 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `water-tracker-handler` |
| 数据库集合 | `water_records` |
