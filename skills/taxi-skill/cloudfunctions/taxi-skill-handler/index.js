// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 目的地种子数据（来自 seed.js）
const destinations = [
  { id: 'D001', name: '北京首都国际机场', address: '北京市朝阳区首都机场路', lat: 40.0799, lng: 116.6031, distance: '28km' },
  { id: 'D002', name: '北京南站', address: '北京市丰台区永外大街车站路', lat: 39.8650, lng: 116.3785, distance: '12km' },
  { id: 'D003', name: '三里屯太古里', address: '北京市朝阳区三里屯路19号', lat: 39.9335, lng: 116.4551, distance: '5km' },
  { id: 'D004', name: '望京SOHO', address: '北京市朝阳区望京东园四区', lat: 39.9958, lng: 116.4803, distance: '3km' },
  { id: 'D005', name: '中关村软件园', address: '北京市海淀区东北旺西路8号', lat: 40.0508, lng: 116.2989, distance: '15km' }
]

// 车型种子数据（来自 seed.js）
const carTypes = [
  { id: 'express', name: '快车', icon: '🚗', basePrice: 13, pricePerKm: 2.1, pricePerMin: 0.5, desc: '经济实惠', eta: '3分钟', color: '#1C8EFF' },
  { id: 'premium', name: '专车', icon: '🚙', basePrice: 18, pricePerKm: 3.5, pricePerMin: 0.8, desc: '舒适品质', eta: '5分钟', color: '#FF8C00' },
  { id: 'carpool', name: '拼车', icon: '🚕', basePrice: 10, pricePerKm: 1.5, pricePerMin: 0.3, desc: '绿色出行', eta: '7分钟', color: '#34C759' }
]

// 计算预估价格
function estimatePrice(distanceKm, carType, estimatedMin) {
  const ct = carTypes.find(c => c.id === carType)
  if (!ct) return 0
  return Math.round(ct.basePrice + ct.pricePerKm * distanceKm + ct.pricePerMin * estimatedMin)
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  switch (action) {
    case 'estimateTrip': {
      const { origin, destinationId } = event
      const dest = destinations.find(d => d.id === destinationId)
      if (!dest) {
        return { code: -1, msg: '目的地不存在' }
      }
      const distanceKm = parseFloat(dest.distance)
      const estimates = carTypes.map(ct => ({
        ...ct,
        estimatedPrice: estimatePrice(distanceKm, ct.id, 30),
        estimatedDuration: Math.round(distanceKm * 3) + '分钟'
      }))
      return {
        code: 0,
        data: {
          origin,
          destination: dest,
          estimates
        }
      }
    }

    case 'callTaxi': {
      const { origin, destination, carType, price } = event
      if (!origin || !destination || !carType || !price) {
        return { code: -1, msg: '参数不完整' }
      }
      const tripId = 'T' + Date.now()
      const ct = carTypes.find(c => c.id === carType)
      const drivers = ['张师傅', '李师傅', '王师傅', '赵师傅', '刘师傅']
      const plates = ['京B·12345', '京A·67890', '京C·54321', '京D·11111', '京E·22222']
      const randomIdx = Math.floor(Math.random() * drivers.length)
      const trip = {
        tripId,
        origin,
        destination,
        carType,
        price,
        status: 'en_route',
        driverInfo: {
          name: drivers[randomIdx],
          plateNumber: plates[randomIdx],
          phone: '138****8888'
        },
        openid,
        createdAt: new Date()
      }
      await db.collection('trips').add({ data: trip })
      return {
        code: 0,
        data: {
          tripId,
          status: 'en_route',
          driverInfo: trip.driverInfo,
          estimatedArrival: ct ? ct.eta : '3分钟'
        }
      }
    }

    case 'getTripStatus': {
      const { tripId } = event
      if (!tripId) {
        return { code: -1, msg: '缺少行程ID' }
      }
      const res = await db.collection('trips').where({ tripId, openid }).get()
      if (res.data.length === 0) {
        return { code: -1, msg: '行程不存在' }
      }
      return { code: 0, data: res.data[0] }
    }

    case 'getTripHistory': {
      const { page = 1, pageSize = 10 } = event
      const res = await db.collection('trips')
        .where({ openid })
        .orderBy('createdAt', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      return { code: 0, data: res.data }
    }

    default:
      return { code: -1, msg: `未知 action: ${action}` }
  }
}
