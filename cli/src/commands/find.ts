// ── find 命令 ──
// 搜索远程仓库中的可用 Skill

import { listRemoteSkills } from '../lib/git.js'
import { parseSource } from '../lib/source-parser.js'
import { log, title } from '../lib/utils.js'

interface FindOptions {
  keyword?: string
  all?: boolean
}

const REGISTRIES = [
  'TencentCloudBase/awesome-miniprogram-skills',
  'wechat-miniprogram/ai-mode-skills',
]

export async function findCommand(keyword: string, opts: FindOptions) {
  title(`🔍 搜索 Skill${keyword ? `: "${keyword}"` : ''}`)

  for (const repo of REGISTRIES) {
    try {
      const info = parseSource(repo)
      const skills = await listRemoteSkills(info)

      if (skills.length === 0) continue

      // 按关键词过滤
      const matched = keyword
        ? skills.filter((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))
        : skills

      if (matched.length === 0) continue

      log(`\n${repo}:`)
      for (const s of matched) {
        log(`  ${s.name}`)
        log(`    → mp-skills add ${repo} --skill ${s.name}`)
      }
    } catch {}
  }

  log('')
  log(`共搜索 ${REGISTRIES.length} 个仓库`)
}
