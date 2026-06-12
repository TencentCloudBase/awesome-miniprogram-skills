function mockGenerateText(prompt, model) {
  const mocks = {
    'hy3-preview': `这是 AI 对"${prompt}"的模拟回复。预览模式下使用 mock 数据，正式模式将调用混元大模型生成真实内容。`,
    cloudbase: `这是 AI 对"${prompt}"的模拟回复。预览模式下使用 mock 数据，正式模式将调用云端大模型生成真实内容。`,
    'deepseek-v4': `（DeepSeek 深度推理）关于"${prompt}"的分析如下：\n\n1. 首先，这是一个预览模式的模拟回复\n2. 正式模式下，DeepSeek 模型将提供更深入的分析\n3. 内容包括详细推理过程和结论`,
    hunyuan: `（混元模型）关于"${prompt}"：\n\n预览模式下展示此占位内容。正式模式将调用混元大模型生成高质量中文内容。`
  }
  return mocks[model] || mocks['hy3-preview']
}

function seedData(params) {
  const { prompt, model = 'hy3-preview', systemPrompt = '' } = params
  const text = mockGenerateText(prompt, model)
  return {
    text,
    model,
    systemPrompt,
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  }
}

module.exports = { seedData }
