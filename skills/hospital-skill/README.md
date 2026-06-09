# hospital-skill

医院挂号，支持搜索医院、查看科室时段、预约挂号及查看记录。

## 功能

- 按关键词搜索医院及科室
- 查看指定科室的可挂号时段与医生信息
- 选择时段完成预约挂号
- 查看历史挂号记录

## 用户输入示例

- "帮我挂个号"
- "预约看病"
- "附近有哪些医院"
- "挂呼吸科的号"
- "看看我的挂号记录"
- "预约明天上午的号"

## 原子接口

| 接口名 | 说明 |
|--------|------|
| `searchHospitals` | 查询医院列表（含科室信息） |
| `getAvailableSlots` | 查看指定科室的可挂号时段 |
| `bookAppointment` | 为指定时段执行预约挂号 |
| `getMyAppointments` | 查询当前用户的挂号记录 |

## 原子组件

| 组件路径 | 说明 |
|---------|------|
| `components/hospital-list-card/index` | 医院列表展示 |
| `components/slot-list-card/index` | 科室时段选择 |
| `components/booking-result-card/index` | 挂号结果展示 |
| `components/appointment-list-card/index` | 挂号记录列表 |

## 后端依赖

| 资源 | 名称 |
|------|------|
| 云函数 | `hospital-skill-handler` |
| 数据库集合 | `hospital_appointments` |
