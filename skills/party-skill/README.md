# party-skill

聚会安排，支持创建聚会、获取场地推荐、邀请朋友及查看聚会详情。

## 功能

- 创建聚会活动（名称/日期/时间/地点）
- 获取聚会场地推荐（餐厅/轰趴馆/KTV/户外）
- 邀请朋友参加聚会
- 查看聚会详情与成员状态

## 用户输入示例

- "周末搞个聚会"
- "推荐几个聚会场所"
- "邀请朋友来玩"
- "看看聚会详情"
- "创建个生日派对"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `createParty` | 创建聚会活动 |
| `getRecommendations` | 获取聚会推荐（餐厅/场地/娱乐场所） |
| `inviteFriends` | 邀请朋友参加聚会 |
| `getPartyDetails` | 查看聚会详情 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/party-create-card/index` | 聚会创建表单 |
| `components/recommend-card/index` | 聚会推荐列表 |
| `components/invite-card/index` | 邀请朋友界面 |
| `components/party-detail-card/index` | 聚会详情展示 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `party-skill-handler` |
| 数据库集合 | `parties` |
