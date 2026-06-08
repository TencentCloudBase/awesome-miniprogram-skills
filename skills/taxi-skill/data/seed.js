// skills/taxi-skill/data/seed.js
const destinations = [
  { id: 'D001', name: '北京首都国际机场', address: '北京市朝阳区首都机场路', lat: 40.0799, lng: 116.6031, distance: '28km' },
  { id: 'D002', name: '北京南站', address: '北京市丰台区永外大街车站路', lat: 39.8650, lng: 116.3785, distance: '12km' },
  { id: 'D003', name: '三里屯太古里', address: '北京市朝阳区三里屯路19号', lat: 39.9335, lng: 116.4551, distance: '5km' },
  { id: 'D004', name: '望京SOHO', address: '北京市朝阳区望京东园四区', lat: 39.9958, lng: 116.4803, distance: '3km' },
  { id: 'D005', name: '中关村软件园', address: '北京市海淀区东北旺西路8号', lat: 40.0508, lng: 116.2989, distance: '15km' }
]

const carTypes = [
  { id: 'express', name: '快车', icon: '🚗', basePrice: 13, pricePerKm: 2.1, pricePerMin: 0.5, desc: '经济实惠', eta: '3分钟', color: '#1C8EFF' },
  { id: 'premium', name: '专车', icon: '🚙', basePrice: 18, pricePerKm: 3.5, pricePerMin: 0.8, desc: '舒适品质', eta: '5分钟', color: '#FF8C00' },
  { id: 'carpool', name: '拼车', icon: '🚕', basePrice: 10, pricePerKm: 1.5, pricePerMin: 0.3, desc: '绿色出行', eta: '7分钟', color: '#34C759' }
]

const historyTrips = [
  {
    tripId: 'H001',
    origin: '望京SOHO',
    destination: '北京首都国际机场',
    carType: 'express',
    carTypeName: '快车',
    price: 68,
    status: 'completed',
    startTime: '2026-06-07 14:30',
    endTime: '2026-06-07 15:10',
    duration: '40分钟',
    distance: '28km',
    driverName: '张师傅',
    plateNumber: '京B·12345'
  },
  {
    tripId: 'H002',
    origin: '中关村软件园',
    destination: '北京南站',
    carType: 'premium',
    carTypeName: '专车',
    price: 56,
    status: 'completed',
    startTime: '2026-06-06 09:00',
    endTime: '2026-06-06 09:40',
    duration: '40分钟',
    distance: '15km',
    driverName: '李师傅',
    plateNumber: '京A·67890'
  },
  {
    tripId: 'H003',
    origin: '三里屯太古里',
    destination: '望京SOHO',
    carType: 'carpool',
    carTypeName: '拼车',
    price: 22,
    status: 'cancelled',
    startTime: '2026-06-05 20:15',
    endTime: '',
    duration: '',
    distance: '5km',
    driverName: '',
    plateNumber: ''
  }
]

const activeTrip = {
  tripId: 'A001',
  origin: '望京SOHO',
  destination: '北京首都国际机场',
  carType: 'express',
  carTypeName: '快车',
  price: 68,
  status: 'en_route',
  statusText: '司机已接单，正在赶来',
  startTime: '2026-06-08 10:00',
  driverName: '王师傅',
  plateNumber: '京C·54321',
  driverPhone: '138****8888',
  driverLat: 39.9910,
  driverLng: 116.4760,
  pickupLat: 39.9958,
  pickupLng: 116.4803,
  estimatedArrival: '3分钟',
  remainingDistance: '0.8km'
}

module.exports = {
  destinations,
  carTypes,
  historyTrips,
  activeTrip
}
