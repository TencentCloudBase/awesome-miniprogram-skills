// CLI 路由入口 — 解析命令并分发给对应的处理器
import { program } from 'commander'
import { createRequire } from 'node:module'
import { setVersion, flushTelemetry } from './lib/telemetry.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

setVersion(version)

program
  .name('mp-skills')
  .description('CLI for managing WeChat Mini Program AI Skills (wx.modelContext)')
  .version(version)

// ── add — 向已有小程序安装 Skill ──────────────────────────
program
  .command('add <source>')
  .description('Install a Skill from a registry name, GitHub repo, URL, or local path')
  .option('-l, --list', 'List available Skills without installing')
  .option('--skill <name>', 'Install a specific Skill from the source')
  .option('--all', 'Install all Skills from the source')
  .option('-y, --yes', 'Skip confirmation prompts')
  .action(async (source, opts) => {
    const { addCommand } = await import('./commands/add.js')
    await addCommand(source, opts)
  })

// ── list — 列出已安装或远程可用的 Skill ─────────────────
program
  .command('list')
  .description('List installed Skills')
  .option('-r, --remote', 'List remotely available Skills from registry')
  .option('--all', 'List both installed and remote')
  .action(async (opts) => {
    const { listCommand } = await import('./commands/list.js')
    await listCommand(opts)
  })

// ── find — 搜索远程 Skill ────────────────────────────────
program
  .command('find [keyword]')
  .description('Search for Skills in remote repositories')
  .action(async (keyword) => {
    const { findCommand } = await import('./commands/find.js')
    await findCommand(keyword || '')
  })

// ── remove — 移除已安装的 Skill ──────────────────────────
program
  .command('remove <name>')
  .description('Remove an installed Skill')
  .option('--all', 'Remove all installed Skills')
  .action(async (name, opts) => {
    const { removeCommand } = await import('./commands/remove.js')
    await removeCommand(name, opts)
  })

// ── init — 创建一个空的 Skill 模板 ────────────────────────
program
  .command('init [name]')
  .description('Create an empty Skill template in the current or specified directory')
  .action(async (name) => {
    const { initCommand } = await import('./commands/init.js')
    await initCommand(name || 'my-skill')
  })

// ── create — 创建一个新的小程序项目 ─────────────────────
program
  .command('create <name>')
  .description('Create a new mini-program project with AI Skill support')
  .action(async (name) => {
    const { createCommand } = await import('./commands/create.js')
    await createCommand(name)
  })

// ── update — 更新已安装的 Skill ──────────────────────────
program
  .command('update [skills...]')
  .description('Check and update installed Skills')
  .action(async (skills) => {
    const { updateCommand } = await import('./commands/update.js')
    await updateCommand(skills)
  })

// ── validate / execute / render ── 质检 ──────────────────
program
  .command('validate [project-dir]')
  .description('Run static validation on Skills in the project')
  .action(async (dir) => {
    const { validateCommand } = await import('./commands/validate.js')
    await validateCommand(dir || '.')
  })

program
  .command('execute')
  .description('Execute an atomic interface in a Skill')
  .requiredOption('--name <api-name>', 'API name to execute')
  .option('--args <json>', 'Arguments as JSON string')
  .option('--project <path>', 'Project path', '.')
  .action(async (opts) => {
    const { executeCommand } = await import('./commands/execute.js')
    await executeCommand(opts)
  })

program
  .command('render')
  .description('Render a Skill component')
  .requiredOption('--name <api-name>', 'API name to render')
  .option('--project <path>', 'Project path', '.')
  .action(async (opts) => {
    const { renderCommand } = await import('./commands/render.js')
    await renderCommand(opts)
  })

// Parse args
program.parse()

// 退出前等待遥测发送完成
process.on('beforeExit', async () => {
  await flushTelemetry()
})
