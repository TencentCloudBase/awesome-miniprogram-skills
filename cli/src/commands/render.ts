// ── render 命令 ──
// 封装 wxa-skills-validate 的组件渲染

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { log } from '../lib/utils.js'

interface RenderOptions {
  name: string
  project: string
}

export async function renderCommand(opts: RenderOptions): Promise<void> {
  const script = findScript('render.mjs')
  if (!script) {
    log('未找到 wxa-skills-validate。请先安装: npm install -g wxa-skills-validate')
    return
  }

  const cmd = `node "${script}" --project "${opts.project}" --name "${opts.name}"`

  log(`🎨 渲染组件: ${opts.name}`)
  try {
    execSync(cmd, { stdio: 'inherit', timeout: 180_000 })
  } catch {
    /* ignore */
  }
}

function findScript(name: string): string | null {
  const home = process.env.HOME || '~'
  const candidates = [
    join(home, '.codebuddy', 'skills', 'wxa-skills-validate', 'scripts', name),
    join('/usr/local/lib/node_modules', 'wxa-skills-validate', 'scripts', name),
    join(home, '.nvm', 'versions', 'node', 'lib', 'node_modules', 'wxa-skills-validate', 'scripts', name),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  return null
}
