const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({ env: cloud.DYNAMIC_CURRENT_ENV, timeout: 60000 })

exports.main = async (event) => {
  const { action, prompt, systemPrompt, model = 'hy3-preview', temperature = 0.7, maxTokens = 2048 } = event

  if (action !== 'generateText') {
    return { code: -1, message: `未知 action: ${action}` }
  }

  if (!prompt) {
    return { code: -1, message: '缺少 prompt 参数' }
  }

  try {
    const messages = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const modelNameMap = {
      cloudbase: 'deepseek-v4-flash',
      'deepseek-v4': 'deepseek-v4-flash',
      hunyuan: 'hunyuan-2.0-instruct-20251111'
    }

    const ai = app.ai()
    const aiModel = ai.createModel('cloudbase')
    const result = await aiModel.generateText({
      model: modelNameMap[model] || model,
      messages,
      temperature,
      max_tokens: maxTokens
    })

    return {
      code: 0,
      data: {
        text: result.text,
        model,
        usage: result.usage
      }
    }
  } catch (err) {
    console.error('[text-gen-handler] error:', err)
    return { code: -1, message: err.message || '服务器错误' }
  }
}
