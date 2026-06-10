// ── find 命令 ──
// 从中心化注册表搜索远程 Skill

import { log, title, warn } from '../lib/utils.js'

const REGISTRY_URL =
  'https://raw.githubusercontent.com/TencentCloudBase/awesome-miniprogram-skills/feat/skill-market/cli/src/registry.json'

interface Registry {
  version: number
  repositories: Array<{
    name: string
    repo: string
    ref: string
    skills: Array<{ name: string; description: string }>
  }>
}

/**
 * 从远程加载注册表
 */
async function fetchRegistry(): Promise<Registry> {
  const res = await fetch(REGISTRY_URL, {
    headers: {
      'User-Agent': 'mp-skills-cli',
      Accept: 'application/vnd.github.v3.raw',
    },
  })
  if (!res.ok) throw new Error(`注册表加载失败 (${res.status})`)
  return res.json()
}

export async function findCommand(keyword: string) {
  title(`🔍 搜索 Skill${keyword ? `: "${keyword}"` : ''}`)

  let registry: Registry
  try {
    registry = await fetchRegistry()
  } catch (err: any) {
    warn(`无法加载注册表: ${err.message}`)
    log('请检查网络连接后重试')
    return
  }

  let total = 0
  for (const repo of registry.repositories) {
    const matched = keyword
      ? repo.skills.filter(
          (s) =>
            s.name.toLowerCase().includes(keyword.toLowerCase()) ||
            s.description.toLowerCase().includes(keyword.toLowerCase()),
        )
      : repo.skills

    if (matched.length === 0) continue

    log(`\n${repo.repo}:`)
    for (const s of matched) {
      log(`  ${s.name}`)
      log(`    ${s.description.slice(0, 100)}`)
      log(`    → mp-skills add ${repo.repo} --skill ${s.name}`)
    }
    total += matched.length
  }

  log(`\n共 ${total} 个匹配结果（来自 ${registry.repositories.length} 个仓库）`)
}
