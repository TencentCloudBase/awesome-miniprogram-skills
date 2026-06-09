// skills/<skill>/apis/greet.js — 问候示例接口
function greet(params = {}) {
  const { name } = params || {}
  const greeting = name ? `你好，${name}！` : '你好！'
  const message = `${greeting} 欢迎体验小程序 AI 模式。`

  return {
    content: [{ type: 'text', text: message }],
    structuredContent: { message },
  }
}

module.exports = greet
