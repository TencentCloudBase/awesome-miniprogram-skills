const { isPreviewMode, ensureCloudInit, successResult, errorResult } = require('../utils/util')
const { seedData } = require('../data/seed')
const { translateError } = require('../../_shared/mp-skills-shared/utils/cloud-error-handler')

async function generateText(params = {}) {
  const { prompt, systemPrompt, model = 'hy3-preview', temperature = 0.7, maxTokens = 2048 } = params

  if (!prompt) {
    return errorResult('缺少 prompt 参数。请提供要生成文本的内容描述。')
  }

  // 预览模式：返回 seed/mock 数据
  if (isPreviewMode()) {
    const data = seedData({ prompt, model, systemPrompt })
    return successResult(
      `已生成文本（模型：${model}，预览模式）`,
      { text: data.text, model: data.model, usage: data.usage },
      { rawText: data.text }
    )
  }

  // 正式模式：直接调用 wx.cloud.extend.AI
  try {
    ensureCloudInit()
    const aiModel = wx.cloud.extend.AI.createModel('cloudbase')

    const messages = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const res = await aiModel.generateText({
      model: modelToApiName(model),
      messages,
      temperature,
      max_tokens: maxTokens
    })

    const text = res.choices && res.choices[0] && res.choices[0].message
      ? res.choices[0].message.content
      : (res.text || '')
    const usage = res.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

    return successResult(
      `文本生成完成（模型：${model}）`,
      {
        text,
        model,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0
        }
      },
      { rawText: text }
    )
  } catch (err) {
    console.error('[generateText] error:', err)
    const friendlyMsg = translateError(err, 'text-gen-handler')
    return errorResult(friendlyMsg)
  }
}

function modelToApiName(model) {
  const map = {
    cloudbase: 'deepseek-v4-flash',
    'deepseek-v4': 'deepseek-v4-flash',
    hunyuan: 'hunyuan-2.0-instruct-20251111'
  }
  return map[model] || model
}

module.exports = generateText
