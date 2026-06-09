# taxi-skill

出行打车，支持预估行程、呼叫出租车、查看行程状态及历史记录。

## 功能

- 预估各车型（快车/专车/拼车）价格与时长
- 发起叫车请求
- 实时查看行程状态与司机信息
- 查看历史行程记录

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `estimateTrip` | 预估行程价格与时长 |
| `callTaxi` | 呼叫出租车 |
| `getTripStatus` | 查看行程状态 |
| `getTripHistory` | 查看历史行程 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/trip-estimate-card/index` | 行程预估卡片 |
| `components/calling-taxi-card/index` | 叫车状态卡片 |
| `components/trip-status-card/index` | 行程状态卡片 |
| `components/trip-history-card/index` | 历史行程列表卡片 |
