# queue-skill

门店排队取号，支持搜索门店、查看排队状态、取号及查看排队进度。

## 功能

- 搜索可排队门店列表
- 查看单个门店当前排队状态
- 为指定门店取号排队
- 查询排队票当前进度

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchStores` | 查询可排队门店列表 |
| `getStoreQueueStatus` | 查看单个门店当前排队状态 |
| `takeQueueNumber` | 为指定门店生成排队票 |
| `getQueueProgress` | 查询排队票当前进度 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/store-list-card/index` | 门店列表展示 |
| `components/store-queue-status-card/index` | 门店排队状态展示 |
| `components/queue-ticket-card/index` | 取号结果展示 |
| `components/queue-progress-card/index` | 排队进度展示 |

## 后端依赖

- 云函数：`ai-handler`（actions: searchStores, getStoreQueueStatus, takeQueueNumber, getQueueProgress）
- 数据库集合：`app_data`（排队票据）
