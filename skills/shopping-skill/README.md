# shopping-skill

潮玩购物，支持搜索商品、查看详情、查询门店库存及下单购买。

## 功能

- 搜索或推荐潮玩商品（盲盒/手办/周边）
- 查看商品完整详情与门店库存
- 查询各门店库存情况
- 下单购买指定门店商品

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchProducts` | 搜索或推荐潮玩商品 |
| `getProductDetail` | 查看某款潮玩商品完整详情 |
| `checkStoreStock` | 查询某款商品在各门店的库存 |
| `placeOrder` | 下单购买潮玩商品 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/product-list-card/index` | 商品列表展示 |
| `components/product-detail-card/index` | 商品详情展示 |
| `components/stock-check-card/index` | 门店库存查询 |
| `components/order-success-card/index` | 下单成功结果展示 |
