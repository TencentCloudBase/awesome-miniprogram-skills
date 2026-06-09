// ── list 命令 ──
// 列出已安装和远程可用的 Skill

import { existsSync, readdirSync, Dirent } from 'node:fs'
import { join, resolve } from 'node:path'
import { loadRegistry } from '../lib/source-parser.js'
import { log, title } from '../lib/utils.js'

interface ListOptions {
  remote?: boolean
  all?: boolean
}

export async function listCommand(opts: ListOptions): Promise<void> {
  const projectPath = resolve('.')

  // 列出已安装
  if (!opts.remote || opts.all) {
    const skillsDir = join(projectPath, 'skills')
    title('📋 本地已安装:')
    if (existsSync(skillsDir)) {
      const entries = readdirSync(skillsDir, { withFileTypes: true }).filter(
        (e: Dirent) => e.isDirectory() && existsSync(join(skillsDir, e.name, 'mcp.json')),
      )
      if (entries.length === 0) {
        log('   暂无 Skill')
        log('   运行 mp-skills add <source> 安装')
      }
      for (const entry of entries) {
        log(`  ${entry.name}`)
      }
    } else {
      log('   暂无 Skill')
      log('   运行 mp-skills add <source> 安装')
    }
  }

  // 列出远程
  if (opts.remote || opts.all) {
    const reg = loadRegistry()
    title('\n📡 远程可用:')
    for (const repo of reg.repositories) {
      log(`  ${repo.name} (${repo.repo})`)
      if (repo.skills) {
        for (const s of repo.skills) {
          log(`    ${s.name}  — ${s.description}`)
        }
      }
      log(`    → mp-skills add ${repo.name}`)
    }
  }
}
