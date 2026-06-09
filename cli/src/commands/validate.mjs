// ── validate 命令 ──
// 封装 wxa-skills-validate 的静态校验

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { log, warn } from '../lib/utils.mjs'

export async function validateCommand(projectDir) {
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
    if (err.status === 1) {
      warn('校验未通过，请修复后重试')
    } else {
      warn(`校验异常: ${err.message}`)
    }
  }
}

function findScript(name) {
  // 检查常见安装位置
  const candidates = [
    // 全局 node_modules
    import.meta.resolve ? null : null,
    // 用户目录
    join(process.env.HOME || '~', '.codebuddy', 'skills', 'wxa-skills-validate', 'scripts', name),
    join(process.env.HOME || '~', '.nvm', 'versions', 'node', 'lib', 'node_modules', 'wxa-skills-validate', 'scripts', name),
    join('/usr/local/lib/node_modules', 'wxa-skills-validate', 'scripts', name),
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}
