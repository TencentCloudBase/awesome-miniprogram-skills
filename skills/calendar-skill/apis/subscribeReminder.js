/**
 * subscribeReminder - 订阅日程提醒
 * 使用小程序原生 wx.requestSubscribeMessage 请求用户授权
 * 云函数定时触发器到期时通过 cloud.openapi.subscribeMessage.send 推送
 */
const config = require('../config')
const {
  isPreviewMode,
  callCloud,
  successResult,
  errorResult,
  formatDateTime,
  getRemindText
} = require('../utils/util')
const { updateLocalEvent, getLocalEventById, incrementSubscribeCount } = require('../utils/storage')

async function subscribeReminder(params = {}) {
  const { eventId, remindBefore = 15 } = params

  // 参数校验
  if (!eventId) {
    return errorResult('请提供要设置提醒的日程 ID')
  }

  // 获取日程信息
  let event = null
  if (isPreviewMode()) {
    event = getLocalEventById(eventId)
  } else {
    const result = await callCloud('getEventById', { eventId })
    event = result && result.event
  }

  if (!event) {
    return errorResult('未找到该日程，可能已被删除')
  }

  // 请求订阅消息授权
  // 使用小程序原生 wx.requestSubscribeMessage
  const templateId = config.subscribeTemplateId

  if (templateId) {
    try {
      const subResult = await new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: [templateId],
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          }
        })
      })

      // 检查用户是否同意
      if (subResult[templateId] === 'accept') {
        // 用户同意，更新日程订阅状态，同时将 templateId 存入日程记录
        if (isPreviewMode()) {
          updateLocalEvent(eventId, {
            subscribed: true,
            remindBefore,
            templateId
          })
          incrementSubscribeCount()
        } else {
          await callCloud('subscribeReminder', {
            eventId,
            remindBefore,
            subscribed: true,
            templateId
          })
        }

        const startDisplay = formatDateTime(event.startTime)

        return successResult(
          `已为日程「${event.title}」设置提醒，将在${getRemindText(remindBefore)}通过微信服务通知提醒您`,
          {
            action: 'subscribe',
            eventId: event.eventId,
            title: event.title,
            category: event.category,
            startTime: event.startTime,
            startDisplay: startDisplay.display,
            remindBefore,
            remindText: getRemindText(remindBefore),
            subscribed: true,
            subscribeStatus: 'accepted'
          }
        )
      } else {
        // 用户拒绝
        return successResult(
          `您未授权订阅消息，无法设置到期提醒。您可以稍后再试`,
          {
            action: 'subscribe',
            eventId: event.eventId,
            title: event.title,
            startTime: event.startTime,
            startDisplay: formatDateTime(event.startTime).display,
            subscribed: false,
            subscribeStatus: 'rejected'
          }
        )
      }
    } catch (err) {
      console.warn('[calendar-skill] requestSubscribeMessage failed:', err)
      // 订阅接口调用失败，仍然设置本地提醒标记
    }
  }

  // 没有模板 ID 或订阅失败时，仅设置提醒时间（不发推送）
  if (isPreviewMode()) {
    updateLocalEvent(eventId, {
      remindBefore,
      subscribed: false
    })
  } else {
    await callCloud('subscribeReminder', {
      eventId,
      remindBefore,
      subscribed: false
    })
  }

  const startDisplay = formatDateTime(event.startTime)

  return successResult(
    `已为日程「${event.title}」设置${getRemindText(remindBefore)}提醒（未获得订阅消息授权，仅应用内提醒）`,
    {
      action: 'subscribe',
      eventId: event.eventId,
      title: event.title,
      category: event.category,
      startTime: event.startTime,
      startDisplay: startDisplay.display,
      remindBefore,
      remindText: getRemindText(remindBefore),
      subscribed: false,
      subscribeStatus: 'no_template'
    }
  )
}

module.exports = subscribeReminder
