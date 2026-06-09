# order-skill

外卖点餐，支持搜索餐厅、查看菜单、下单及查看配送状态。

## 功能

- 按关键词搜索附近餐厅
- 查看餐厅菜单与菜品详情
- 选择菜品并下单
- 实时查看订单配送状态与骑手信息

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchRestaurants` | 搜索附近餐厅列表 |
| `getMenuItems` | 查看指定餐厅的菜单与菜品列表 |
| `placeOrder` | 提交订单（含菜品、地址、联系电话） |
| `getOrderStatus` | 查询订单当前配送状态 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/restaurant-list-card/index` | 餐厅列表展示 |
| `components/menu-list-card/index` | 菜单与菜品列表 |
| `components/order-confirm-card/index` | 订单确认与下单 |
| `components/order-status-card/index` | 配送状态与骑手信息 |
