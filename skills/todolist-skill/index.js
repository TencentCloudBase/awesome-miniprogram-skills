const getTodoList = require('./apis/getTodoList.js')
const addTodo = require('./apis/addTodo.js')
const toggleTodo = require('./apis/toggleTodo.js')
const deleteTodo = require('./apis/deleteTodo.js')

function registerAPIs() {
  const skill = wx.modelContext.createSkill('skills/todolist-skill')

  skill.use(async (ctx, next) => {
    try {
      console.info('[ai-mode] [todolist-skill] middleware start name=', ctx.name)
      await next()
      console.info('[ai-mode] [todolist-skill] middleware finish name=', ctx.name)
    } catch (err) {
      console.error('[ai-mode] [todolist-skill] middleware error:', err.message)
      throw err
    }
  })

  skill.registerAPI('getTodoList', getTodoList)
  skill.registerAPI('addTodo', addTodo)
  skill.registerAPI('toggleTodo', toggleTodo)
  skill.registerAPI('deleteTodo', deleteTodo)

  console.info('[ai-mode] [todolist-skill] APIs registered via createSkill')
}

registerAPIs()
