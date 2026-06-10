// water-tracker-handler 云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const DEFAULT_GOAL_ML = 2000

function buildDaily(date, records) {
  const totalMl = records.reduce((sum, r) => sum + Number(r.amountMl || 0), 0)
  return {
    date,
    totalMl,
    goalMl: DEFAULT_GOAL_ML,
    records: records.map(r => ({
      amountMl: Number(r.amountMl || 0),
      note: r.note || '',
      drankAt: r.drankAt || ''
    }))
  }
}

function getDateRange(days) {
  const list = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    list.push(`${y}-${m}-${day}`)
  }
  return list
}

exports.main = async (event, context) => {
  const { action, openid, amountMl, note, date, days } = event

  try {
    // 添加饮水记录
    if (action === 'addWater') {
      if (!openid || amountMl === undefined) {
        return { code: -1, message: '缺少必要参数' }
      }
      const today = date || new Date().toISOString().slice(0, 10)
      const drankAt = new Date().toISOString()
      await db.collection('water_daily').add({
        data: { openid, amountMl: Number(amountMl), note: note || '', date: today, drankAt }
      })
      // 查当天全部记录
      const { data: records } = await db.collection('water_daily')
        .where({ openid, date: today })
        .get()
      return { code: 0, data: buildDaily(today, records) }
    }

    // 查询当天记录
    if (action === 'getToday') {
      if (!openid || !date) {
        return { code: -1, message: '缺少必要参数' }
      }
      const { data: records } = await db.collection('water_daily')
        .where({ openid, date })
        .get()
      return { code: 0, data: buildDaily(date, records) }
    }

    // 查询最近 N 天记录
    if (action === 'listDaily') {
      if (!openid) {
        return { code: -1, message: '缺少 openid' }
      }
      const n = Number(days || 7)
      const dateList = getDateRange(n)
      const result = []
      for (const d of dateList) {
        const { data: records } = await db.collection('water_daily')
          .where({ openid, date: d })
          .get()
        result.push(buildDaily(d, records))
      }
      return { code: 0, data: result }
    }

    // 查询用户配置
    if (action === 'getProfile') {
      if (!openid) {
        return { code: -1, message: '缺少 openid' }
      }
      const { data: profiles } = await db.collection('water_profile')
        .where({ openid })
        .get()
      return { code: 0, data: profiles.length > 0 ? profiles[0] : null }
    }

    // 保存/更新用户配置
    if (action === 'saveProfile') {
      if (!openid) {
        return { code: -1, message: '缺少 openid' }
      }
      const { goalMl, remindInterval, remindStart, remindEnd } = event
      const { data: existing } = await db.collection('water_profile')
        .where({ openid })
        .get()
      const profile = {
        openid,
        goalMl: Number(goalMl || DEFAULT_GOAL_ML),
        remindInterval: remindInterval || 60,
        remindStart: remindStart || '08:00',
        remindEnd: remindEnd || '22:00'
      }
      if (existing.length > 0) {
        await db.collection('water_profile').doc(existing[0]._id).update({ data: profile })
      } else {
        await db.collection('water_profile').add({ data: profile })
      }
      return { code: 0, data: profile }
    }

    return { code: -1, message: `未知 action: ${action}` }
  } catch (err) {
    console.error('[water-tracker-handler] error:', err.message)
    return { code: -1, message: err.message }
  }
}
