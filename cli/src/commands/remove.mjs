// ── remove 命令 ──
// 移除已安装的 Skill

import { existsSync, rmSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { log, warn, ok } from '../lib/utils.mjs'

export async function removeCommand(name, opts) {
  const projectPath = resolve('.')
  const skillsDir = join(projectPath, 'skills')

  // 从 app.json 移除配置
  const appJsonPath = join(projectPath, 'miniprogram', 'app.json')
  if (existsSync(appJsonPath)) {
    const { readFileSync, writeFileSync } = await import('node:fs')
    const app = JSON.parse(readFileSync(appJsonPath, 'utf-8'))
    if (app.agent?.skills) {
      app.agent.skills = app.agent.skills.filter(s => s.path !== `skills/${name}`)
      writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n')
    }
  }

  if (opts.all) {
    if (existsSync(skillsDir)) {
      rmSync(skillsDir, { recursive: true, force: true })
    }
    ok('已移除全部 Skill')
    return
  }

  const targetDir = join(skillsDir, name)
  if (!existsSync(targetDir)) {
    warn(`未找到 Skill "${name}"`)
    return
  }

  rmSync(targetDir, { recursive: true })
  ok(`已移除 ${name}`)
}
