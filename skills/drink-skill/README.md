# drink-skill

咖啡饮品点单，支持搜索饮品、选择规格、确认地址、支付下单全流程。

## 功能

- 按场景推荐或搜索饮品
- 查看饮品详情并选择规格（温度/糖度/杯型/加料）
- 确认订单并补充收货地址
- 发起微信支付
- 查看门店排队与状态信息

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `getRecommendedDrinks` | 按场景获取推荐饮品列表（default/coffee/tea/warm） |
| `searchDrinks` | 按关键词搜索饮品 |
| `selectDrink` | 查看某款饮品详情及可选规格 |
| `confirmSku` | 确认饮品规格并生成订单 |
| `getAddress` | 弹出系统地址选择器获取收货地址 |
| `saveAddress` | 保存用户收货地址并续跑订单流程 |
| `confirmOrder` | 展示订单确认信息卡片 |
| `payOrder` | 发起订单支付 |
| `getStoreStatus` | 获取最近门店基础信息 |
| `getAllDrinks` | 获取全部饮品数据（主要供半屏页面使用） |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/recommended-drinks/index` | 推荐/搜索结果饮品列表 |
| `components/drink-detail-card/index` | 饮品详情与规格选择 |
| `components/order-confirm-card/index` | 订单确认（含地址/金额） |
| `components/pay-success-card/index` | 支付成功结果展示 |
| `components/drink-not-found-card/index` | 未找到饮品的提示卡片 |
| `components/store-status-card/index` | 门店排队与预计出杯时间 |
| `components/address-card/index` | 地址选择与管理卡片 |
