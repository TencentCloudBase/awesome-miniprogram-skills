const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID, APPID } = cloud.getWXContext()
  return { openid: OPENID, appid: APPID }
}
