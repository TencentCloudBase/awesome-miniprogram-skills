function seedData(params) {
  const { prompt, style = 'auto', size = '1024x1024', n = 1 } = params
  const images = []
  for (let i = 0; i < n; i++) {
    images.push({
      fileID: '',
      tempUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt + i)}/1024/1024`,
      revisedPrompt: `预览模式: ${prompt}（风格: ${style}，尺寸: ${size}）`
    })
  }
  return { images, usage: { n: images.length } }
}

module.exports = { seedData }
