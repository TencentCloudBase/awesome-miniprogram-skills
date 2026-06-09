// ── update 命令 ──
// 检测已安装 Skill 更新并重新安装

import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { readLock } from '../lib/lock-file.js'
import { listRemoteSkills, cloneRepo, cleanupClone, hashDirectory } from '../lib/git.js'
import { installSkill } from '../lib/installer.js'
import { parseSource, getRegistryRepo } from '../lib/source-parser.js'
import { log, warn, ok, title } from '../lib/utils.js'
import type { LockEntry } from '../types.js'

export async function updateCommand(skills?: string[]) {
  const projectPath = resolve('.')
  const lock = readLock(projectPath)

  if (lock.skills.length === 0) {
    warn('没有已安装的 Skill')
    return
  }

  title('🔍 检查更新...')

  // 按来源分组
  const bySource = new Map<string, LockEntry[]>()
  for (const entry of lock.skills) {
    if (!entry.source) continue
    const list = bySource.get(entry.source) || []
    list.push(entry)
    bySource.set(entry.source, list)
  }

  let updated = 0

  for (const [source, entries] of bySource) {
    try {
      const info = parseSource(source)
      log(`检查 ${info.repoName || source}...`)

      const remoteSkills = await listRemoteSkills(info)
      if (remoteSkills.length === 0) continue

      // 只更新关心的 Skill
      const toCheck = skills ? entries.filter((e) => skills.includes(e.name)) : entries

      // 获取最新版本 → 需要 clone 来对比 hash
      if (!info.repoUrl) {
        warn(`${source}: 非远程来源，跳过`)
        continue
      }
      const tmpDir = cloneRepo(info.repoUrl, info.ref)
      const skillsDir = join(tmpDir, 'skills')

      for (const entry of toCheck) {
        const remotePath = join(skillsDir, entry.name)
        if (!existsSync(remotePath)) {
          warn(`${entry.name} 在远程仓库中已不存在`)
          continue
        }

        const remoteHash = hashDirectory(remotePath)
        if (remoteHash !== entry.hash) {
          log(`  ${entry.name}: 有更新`)
          installSkill(remotePath, projectPath, {
            skillName: entry.name,
            source: info.repoName || info.repoUrl,
          })
          updated++
        } else {
          log(`  ${entry.name}: 已是最新`)
        }
      }

      cleanupClone(tmpDir)
    } catch (err: any) {
      warn(`${source}: ${err.message}`)
    }
  }

  if (updated === 0) {
    ok('所有 Skill 已是最新')
  } else {
    log(`\n✅ 已更新 ${updated} 个 Skill`)
  }
}
