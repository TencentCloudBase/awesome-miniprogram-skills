// skills/travel-skill/apis/getWeatherInfo.js
const {
  isPreviewMode,
  successResult,
  errorResult,
  defaultWeather,
  defaultDestDetail
} = require('../utils/util')

async function getWeatherInfo(params = {}) {
  console.info('[ai-mode] getWeatherInfo 入口, params=', JSON.stringify(params))
  const destId = params && params.destId ? String(params.destId).trim() : ''

  if (!destId) {
    return successResult(
      '缺少目的地信息，请先选择一个目的地。',
      { weather: null, destName: '' },
      { destId: '' }
    )
  }

  if (isPreviewMode()) {
    console.info('[ai-mode] getWeatherInfo 预览模式')
    const weather = defaultWeather(destId)
    const dest = defaultDestDetail(destId)
    if (!weather) {
      return successResult(
        '暂未获取到该目的地的天气信息。',
        { weather: null, destName: dest ? dest.name : '' },
        { destId }
      )
    }
    return buildResult({ weather, destName: dest ? dest.name : '' }, destId)
  }

  const { result } = await wx.cloud.callFunction({
    name: 'travel-skill-handler',
    data: { action: 'getWeatherInfo', destId }
  })
  if (result && result.code === 0 && result.data) {
    return buildResult(result.data, destId)
  }
  return errorResult(result?.message || '查询天气失败')
}

function buildResult(data, destId) {
  return successResult(
    data.weather
      ? `「${data.destName}」当前天气：${data.weather.icon} ${data.weather.temp}°C，${data.weather.condition}。${data.weather.suggestion}`
      : '暂未获取到天气信息。',
    { weather: data.weather || null, destName: data.destName || '' },
    { destId }
  )
}

module.exports = getWeatherInfo
