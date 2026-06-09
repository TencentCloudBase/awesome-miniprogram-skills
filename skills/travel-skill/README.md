# travel-skill

旅行规划，支持搜索目的地、查看行程方案、查询天气及获取旅行贴士。

## 功能

- 搜索热门旅行目的地
- 查看目的地的交通方案与酒店推荐
- 查询目的地当前天气情况
- 获取通用旅行贴士建议

## 用户输入示例

- "想去旅行"
- "推荐几个旅游目的地"
- "三亚有什么好玩的"
- "查一下丽江的天气"
- "规划一下大理的行程"
- "旅游注意事项"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchDestinations` | 搜索热门旅行目的地 |
| `planTrip` | 查看指定目的地的行程规划方案（交通+住宿） |
| `getWeatherInfo` | 查询指定目的地当前天气 |
| `getTravelTips` | 获取通用旅行贴士建议列表 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/destination-list-card/index` | 目的地列表展示 |
| `components/trip-plan-card/index` | 行程规划方案展示 |
| `components/weather-card/index` | 天气信息展示 |
| `components/tips-card/index` | 旅行贴士列表 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `travel-skill-handler` |
| 数据库集合 | `travel_plans` |
