// index.js — Skill 注册入口
const greet = require('./apis/greet')

wx.modelContext.registerAPI('greet', greet)
