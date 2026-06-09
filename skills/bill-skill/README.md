# bill-skill

生活缴费，支持查询待缴账单、完成缴费及查看历史缴费记录。

## 功能

- 查询当前用户的所有待缴账单（水费/电费/燃气费/话费/物业费）
- 为指定账单完成缴费支付
- 查看历史缴费记录

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `getBills` | 查询当前用户所有待缴账单 |
| `payBill` | 为指定账单完成缴费支付 |
| `getPaymentHistory` | 查询历史缴费记录 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/bill-list-card/index` | 待缴账单列表 |
| `components/pay-result-card/index` | 缴费结果展示 |
| `components/history-card/index` | 历史缴费记录列表 |
