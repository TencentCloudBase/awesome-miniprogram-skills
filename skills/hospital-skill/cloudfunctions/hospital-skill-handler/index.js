const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 种子数据（内嵌，不依赖外部 require）
const hospitals = [
  {
    hospitalId: 'H001',
    hospitalName: '北京大学第一医院',
    level: '三甲',
    address: '北京市西城区西什库大街8号',
    phone: '010-83572211',
    rating: 4.8,
    tags: ['综合', '重点'],
    departments: [
      {
        deptId: 'D001',
        deptName: '呼吸内科',
        desc: '呼吸系统疾病诊治',
        slots: [
          { slotId: 'S00101', date: '2026-06-09', time: '08:30-09:00', doctor: '王建国', title: '主任医师', available: 3, price: 100 },
          { slotId: 'S00102', date: '2026-06-09', time: '09:00-09:30', doctor: '王建国', title: '主任医师', available: 2, price: 100 },
          { slotId: 'S00103', date: '2026-06-09', time: '10:00-10:30', doctor: '李明辉', title: '副主任医师', available: 5, price: 60 },
          { slotId: 'S00104', date: '2026-06-10', time: '08:30-09:00', doctor: '王建国', title: '主任医师', available: 1, price: 100 },
          { slotId: 'S00105', date: '2026-06-10', time: '14:00-14:30', doctor: '李明辉', title: '副主任医师', available: 4, price: 60 },
          { slotId: 'S00106', date: '2026-06-11', time: '09:00-09:30', doctor: '张丽华', title: '主治医师', available: 6, price: 30 }
        ]
      },
      {
        deptId: 'D002',
        deptName: '消化内科',
        desc: '消化系统疾病诊治',
        slots: [
          { slotId: 'S00201', date: '2026-06-09', time: '09:00-09:30', doctor: '赵伟', title: '主任医师', available: 2, price: 100 },
          { slotId: 'S00202', date: '2026-06-09', time: '10:30-11:00', doctor: '赵伟', title: '主任医师', available: 3, price: 100 },
          { slotId: 'S00203', date: '2026-06-10', time: '08:00-08:30', doctor: '陈敏', title: '副主任医师', available: 1, price: 60 },
          { slotId: 'S00204', date: '2026-06-10', time: '14:00-14:30', doctor: '陈敏', title: '副主任医师', available: 5, price: 60 },
          { slotId: 'S00205', date: '2026-06-11', time: '09:00-09:30', doctor: '孙悦', title: '主治医师', available: 4, price: 30 }
        ]
      },
      {
        deptId: 'D003',
        deptName: '心血管内科',
        desc: '心血管疾病诊治',
        slots: [
          { slotId: 'S00301', date: '2026-06-09', time: '08:00-08:30', doctor: '刘强', title: '主任医师', available: 1, price: 100 },
          { slotId: 'S00302', date: '2026-06-10', time: '09:30-10:00', doctor: '刘强', title: '主任医师', available: 2, price: 100 },
          { slotId: 'S00303', date: '2026-06-10', time: '15:00-15:30', doctor: '周婷', title: '主治医师', available: 3, price: 30 }
        ]
      }
    ]
  },
  {
    hospitalId: 'H002',
    hospitalName: '北京协和医院',
    level: '三甲',
    address: '北京市东城区帅府园1号',
    phone: '010-69156114',
    rating: 4.9,
    tags: ['综合', '重点', '疑难'],
    departments: [
      {
        deptId: 'D004',
        deptName: '内分泌科',
        desc: '内分泌与代谢疾病',
        slots: [
          { slotId: 'S00401', date: '2026-06-09', time: '08:00-08:30', doctor: '林芳', title: '主任医师', available: 1, price: 200 },
          { slotId: 'S00402', date: '2026-06-09', time: '09:00-09:30', doctor: '林芳', title: '主任医师', available: 0, price: 200 },
          { slotId: 'S00403', date: '2026-06-10', time: '08:30-09:00', doctor: '林芳', title: '主任医师', available: 2, price: 200 },
          { slotId: 'S00404', date: '2026-06-10', time: '10:00-10:30', doctor: '郭磊', title: '副主任医师', available: 3, price: 100 },
          { slotId: 'S00405', date: '2026-06-11', time: '14:00-14:30', doctor: '郭磊', title: '副主任医师', available: 5, price: 100 }
        ]
      },
      {
        deptId: 'D005',
        deptName: '风湿免疫科',
        desc: '风湿免疫性疾病',
        slots: [
          { slotId: 'S00501', date: '2026-06-09', time: '08:30-09:00', doctor: '吴敏', title: '主任医师', available: 1, price: 200 },
          { slotId: 'S00502', date: '2026-06-10', time: '09:00-09:30', doctor: '吴敏', title: '主任医师', available: 2, price: 200 },
          { slotId: 'S00503', date: '2026-06-11', time: '08:00-08:30', doctor: '何琳', title: '主治医师', available: 4, price: 50 }
        ]
      }
    ]
  },
  {
    hospitalId: 'H003',
    hospitalName: '北京朝阳医院',
    level: '三甲',
    address: '北京市朝阳区工体南路8号',
    phone: '010-85231000',
    rating: 4.6,
    tags: ['综合', '急诊'],
    departments: [
      {
        deptId: 'D006',
        deptName: '呼吸内科',
        desc: '呼吸系统疾病诊治',
        slots: [
          { slotId: 'S00601', date: '2026-06-09', time: '08:00-08:30', doctor: '杨波', title: '副主任医师', available: 4, price: 60 },
          { slotId: 'S00602', date: '2026-06-09', time: '14:00-14:30', doctor: '杨波', title: '副主任医师', available: 6, price: 60 },
          { slotId: 'S00603', date: '2026-06-10', time: '09:00-09:30', doctor: '杨波', title: '副主任医师', available: 3, price: 60 },
          { slotId: 'S00604', date: '2026-06-11', time: '08:30-09:00', doctor: '许磊', title: '主治医师', available: 5, price: 30 }
        ]
      },
      {
        deptId: 'D007',
        deptName: '皮肤科',
        desc: '皮肤疾病诊治',
        slots: [
          { slotId: 'S00701', date: '2026-06-09', time: '09:00-09:30', doctor: '郑丽', title: '主任医师', available: 2, price: 100 },
          { slotId: 'S00702', date: '2026-06-10', time: '08:00-08:30', doctor: '郑丽', title: '主任医师', available: 3, price: 100 },
          { slotId: 'S00703', date: '2026-06-10', time: '14:30-15:00', doctor: '王倩', title: '主治医师', available: 4, price: 30 }
        ]
      }
    ]
  },
  {
    hospitalId: 'H004',
    hospitalName: '北京友谊医院',
    level: '三乙',
    address: '北京市西城区永安路95号',
    phone: '010-63016616',
    rating: 4.5,
    tags: ['综合'],
    departments: [
      {
        deptId: 'D008',
        deptName: '消化内科',
        desc: '消化系统疾病诊治',
        slots: [
          { slotId: 'S00801', date: '2026-06-09', time: '08:30-09:00', doctor: '马超', title: '副主任医师', available: 3, price: 50 },
          { slotId: 'S00802', date: '2026-06-09', time: '10:00-10:30', doctor: '马超', title: '副主任医师', available: 4, price: 50 },
          { slotId: 'S00803', date: '2026-06-10', time: '09:00-09:30', doctor: '马超', title: '副主任医师', available: 2, price: 50 },
          { slotId: 'S00804', date: '2026-06-11', time: '08:00-08:30', doctor: '宋婷', title: '主治医师', available: 6, price: 20 }
        ]
      },
      {
        deptId: 'D009',
        deptName: '骨科',
        desc: '骨骼关节疾病',
        slots: [
          { slotId: 'S00901', date: '2026-06-09', time: '09:00-09:30', doctor: '黄刚', title: '主任医师', available: 1, price: 80 },
          { slotId: 'S00902', date: '2026-06-10', time: '08:00-08:30', doctor: '黄刚', title: '主任医师', available: 2, price: 80 },
          { slotId: 'S00903', date: '2026-06-10', time: '15:00-15:30', doctor: '黄刚', title: '主任医师', available: 3, price: 80 }
        ]
      }
    ]
  },
  {
    hospitalId: 'H005',
    hospitalName: '北京海淀医院',
    level: '二甲',
    address: '北京市海淀区中关村大街29号',
    phone: '010-62583042',
    rating: 4.3,
    tags: ['综合', '社区'],
    departments: [
      {
        deptId: 'D010',
        deptName: '普通内科',
        desc: '常见内科疾病',
        slots: [
          { slotId: 'S01001', date: '2026-06-09', time: '08:00-08:30', doctor: '刘洋', title: '副主任医师', available: 5, price: 30 },
          { slotId: 'S01002', date: '2026-06-09', time: '09:30-10:00', doctor: '刘洋', title: '副主任医师', available: 8, price: 30 },
          { slotId: 'S01003', date: '2026-06-10', time: '08:00-08:30', doctor: '刘洋', title: '副主任医师', available: 6, price: 30 },
          { slotId: 'S01004', date: '2026-06-11', time: '09:00-09:30', doctor: '李丽', title: '主治医师', available: 10, price: 15 }
        ]
      },
      {
        deptId: 'D011',
        deptName: '儿科',
        desc: '儿童疾病诊治',
        slots: [
          { slotId: 'S01101', date: '2026-06-09', time: '08:30-09:00', doctor: '赵雪', title: '副主任医师', available: 4, price: 30 },
          { slotId: 'S01102', date: '2026-06-10', time: '09:00-09:30', doctor: '赵雪', title: '副主任医师', available: 3, price: 30 },
          { slotId: 'S01103', date: '2026-06-11', time: '08:00-08:30', doctor: '孙明', title: '主治医师', available: 7, price: 15 }
        ]
      }
    ]
  }
]

function flattenAllSlots() {
  const result = []
  hospitals.forEach((h) => {
    h.departments.forEach((dept) => {
      dept.slots.forEach((slot) => {
        result.push({
          ...slot,
          hospitalId: h.hospitalId,
          hospitalName: h.hospitalName,
          hospitalLevel: h.level,
          deptId: dept.deptId,
          deptName: dept.deptName
        })
      })
    })
  })
  return result
}

async function handleSearchHospitals({ keyword }) {
  const q = String(keyword || '').trim().toLowerCase()
  const filtered = q
    ? hospitals.filter((h) =>
        [h.hospitalName, h.level, h.address, ...h.tags]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    : hospitals
  const items = filtered.map((h) => ({
    hospitalId: h.hospitalId,
    hospitalName: h.hospitalName,
    level: h.level,
    address: h.address,
    rating: h.rating,
    tags: h.tags,
    departments: h.departments.map((d) => ({ deptId: d.deptId, deptName: d.deptName, desc: d.desc }))
  }))
  return {
    code: 0,
    message: 'success',
    data: { items, keyword: q }
  }
}

async function handleGetAvailableSlots({ hospitalId, deptId }) {
  if (!hospitalId) {
    return { code: -1, message: 'hospitalId 不能为空', data: null }
  }
  const hospital = hospitals.find((h) => h.hospitalId === hospitalId)
  if (!hospital) {
    return { code: -1, message: 'hospital_not_found', data: null }
  }

  let departments = hospital.departments
  if (deptId) {
    departments = departments.filter((d) => d.deptId === deptId)
  }

  const slots = []
  departments.forEach((dept) => {
    dept.slots.forEach((slot) => {
      slots.push({
        ...slot,
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.hospitalName,
        deptId: dept.deptId,
        deptName: dept.deptName
      })
    })
  })

  return {
    code: 0,
    message: 'success',
    data: { hospitalId: hospital.hospitalId, hospitalName: hospital.hospitalName, slots }
  }
}

async function handleBookAppointment({ slotId, patientName, patientPhone, openid }) {
  if (!slotId) {
    return { code: -1, message: 'slotId 不能为空', data: null }
  }
  if (!patientName) {
    return { code: -1, message: 'patientName 不能为空', data: null }
  }

  const allSlots = flattenAllSlots()
  const slot = allSlots.find((s) => s.slotId === slotId)
  if (!slot) {
    return { code: -1, message: 'slot_not_found', data: null }
  }
  if (slot.available <= 0) {
    return { code: -1, message: 'slot_unavailable', data: null }
  }

  const appointmentId = `A${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const now = new Date()
  const data = {
    appointmentId,
    hospitalId: slot.hospitalId,
    hospitalName: slot.hospitalName,
    departmentId: slot.deptId,
    departmentName: slot.deptName,
    doctorName: slot.doctor,
    slotDate: slot.date,
    slotTime: slot.time,
    patientName,
    patientPhone: patientPhone || '',
    status: 'confirmed',
    openid: openid || '',
    createdAt: db.serverDate()
  }

  try {
    await db.collection('hospital_appointments').add({ data })
  } catch (e) {
    console.error('[hospital-skill-handler] save appointment failed:', e.message)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      appointmentId: data.appointmentId,
      hospitalName: data.hospitalName,
      departmentName: data.departmentName,
      doctorName: data.doctorName,
      slotDate: data.slotDate,
      slotTime: data.slotTime,
      patientName: data.patientName,
      status: data.status
    }
  }
}

async function handleGetMyAppointments({ openid }) {
  if (!openid) {
    return { code: -1, message: 'openid 不能为空', data: null }
  }
  try {
    const res = await db.collection('hospital_appointments')
      .where({ openid })
      .orderBy('createdAt', 'desc')
      .get()
    return {
      code: 0,
      message: 'success',
      data: { items: res.data || [] }
    }
  } catch (err) {
    console.error('[hospital-skill-handler] getMyAppointments error:', err.message)
    return { code: -1, message: err.message, data: null }
  }
}

exports.main = async (event) => {
  const { action } = event
  console.log('[hospital-skill-handler] action=', action, 'event=', JSON.stringify(event))

  switch (action) {
    case 'searchHospitals':
      return handleSearchHospitals(event)
    case 'getAvailableSlots':
      return handleGetAvailableSlots(event)
    case 'bookAppointment':
      return handleBookAppointment(event)
    case 'getMyAppointments':
      return handleGetMyAppointments(event)
    default:
      return {
        code: -1,
        message: `未知 action: ${action}`,
        data: null
      }
  }
}
