// ── list 命令 ──
// 列出已安装 Skill

import { existsSync, readdirSync, Dirent } from 'node:fs'
import { join, resolve } from 'node:path'
import { log, title } from '../lib/utils.js'

interface ListOptions {
  remote?: boolean
  all?: boolean
}

export async function listCommand(opts: ListOptions): Promise<void> {
  const projectPath = resolve('.')

  if (!opts.remote || opts.all) {
    const skillsDir = join(projectPath, 'skills')
    title('📋 本地已安装:')
    if (existsSync(skillsDir)) {
      const entries = readdirSync(skillsDir, { withFileTypes: true }).filter(
        (e: Dirent) => e.isDirectory() && existsSync(join(skillsDir, e.name, 'mcp.json')),
      )
      if (entries.length === 0) {
        log('   暂无 Skill')
      }
      for (const entry of entries) {
        log(`  ${entry.name}`)
      }
    } else {
      log('   暂无 Skill')
    }
  }

  if (opts.remote || opts.all) {
    title('\n📡 从远程仓库安装:')
    log('  mp-skills add TencentCloudBase/awesome-miniprogram-skills --list')
    log('  mp-skills add wechat-miniprogram/ai-mode-skills --list')
  }
}
