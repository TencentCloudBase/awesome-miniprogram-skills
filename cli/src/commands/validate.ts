// ── validate 命令 ──
// 封装 wxa-skills-validate 的静态校验

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { log, warn } from '../lib/utils.js'

export async function validateCommand(projectDir: string): Promise<void> {
  const projectPath = resolve(projectDir)

  // 尝试从用户安装的 wxa-skills-validate 加载
  const validateScript = findScript('validate.mjs')

  if (!validateScript) {
    warn('未找到 wxa-skills-validate，尝试全局安装...')
    try {
      execSync('npm install -g wxa-skills-validate', { stdio: 'ignore' })
    } catch {
      warn('请先安装 wxa-skills-validate')
      log('  npm install -g wxa-skills-validate')
      return
    }
  }

  log(`🔍 校验项目: ${projectPath}`)
  try {
    execSync(`node "${validateScript}" "${projectPath}"`, {
      stdio: 'inherit',
      timeout: 120_000,
    })
  } catch (err) {
    const error = err as { status?: number; message: string }
    if (error.status === 1) {
      warn('校验未通过，请修复后重试')
    } else {
      warn(`校验异常: ${error.message}`)
    }
  }
}

function findScript(name: string): string | null {
  const home = process.env.HOME || '~'
  const candidates = [
    join(home, '.codebuddy', 'skills', 'wxa-skills-validate', 'scripts', name),
    join(home, '.nvm', 'versions', 'node', 'lib', 'node_modules', 'wxa-skills-validate', 'scripts', name),
    join('/usr/local/lib/node_modules', 'wxa-skills-validate', 'scripts', name),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}
