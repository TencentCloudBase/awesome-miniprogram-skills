// 结果工具：统一错误和成功返回格式
function errorResult(message) {
  return {
    isError: true,
    content: [{ type: 'text', text: message }]
  }
}

function successResult(message, data) {
  return {
    isError: false,
    content: [{ type: 'text', text: message }],
    structuredContent: data || {}
  }
}

module.exports = { errorResult, successResult }
