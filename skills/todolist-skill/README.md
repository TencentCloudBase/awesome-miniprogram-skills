# todolist-skill

简单待办，支持查看待办列表、新增、切换完成状态及删除待办事项。

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
npx mp-skills add TencentCloudBase/awesome-miniprogram-skills -s todolist-skill
```

安装后按本 README 的配置说明完成云函数、数据库或模型能力配置；如该 Skill 声明了云开发资源，可继续执行：

```bash
npx mp-skills setup
```

## 功能

- 查看当前用户待办列表
- 新增一条待办事项
- 切换待办完成状态
- 删除待办事项

## 用户输入示例

- "看看我的待办"
- "新增一个待办"
- "明天交周报"
- "完成这个任务"
- "删除这条待办"
- "还有哪些没做完"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `getTodoList` | 查询当前用户的待办列表 |
| `addTodo` | 新增一条待办事项 |
| `toggleTodo` | 切换某条待办完成状态 |
| `deleteTodo` | 删除一条待办事项 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/todo-list-card/index` | 待办列表展示（含新增/切换/删除交互） |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `todolist-skill-handler` |
| 数据库集合 | `todo_items` |
