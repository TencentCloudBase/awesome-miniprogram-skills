// ── render 命令 ──
// 封装 wxa-skills-validate 的组件渲染

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { log } from '../lib/utils.mjs'

export async function renderCommand(opts) {
  const script = findScript('render.mjs')
  if (!script) {
    log('未找到 wxa-skills-validate。请先安装: npm install -g wxa-skills-validate')
    return
  }

  const cmd = `node "${script}" --project "${opts.project}" --name "${opts.name}"`

  log(`🎨 渲染组件: ${opts.name}`)
  try {
    execSync(cmd, { stdio: 'inherit', timeout: 180_000 })
  } catch {}
}

function findScript(name) {
  const candidates = [
    join(process.env.HOME || '~', '.codebuddy', 'skills', 'wxa-skills-validate', 'scripts', name),
    join('/usr/local/lib/node_modules', 'wxa-skills-validate', 'scripts', name),
    join(process.env.HOME || '~', '.nvm', 'versions', 'node', 'lib', 'node_modules', 'wxa-skills-validate', 'scripts', name),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  return null
}
