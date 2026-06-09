// ── Git 操作 ──
// 处理 git clone / 远端文件读取

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'

/**
 * Clone 一个仓库到临时目录
 * @param {string} repoUrl
 * @param {string} [ref='main']
 * @returns {string} 临时目录路径
 */
export function cloneRepo(repoUrl, ref = 'main') {
  const tmpDir = join(tmpdir(), 'mp-skills-' + randomUUID().slice(0, 8))
  mkdirSync(tmpDir, { recursive: true })
  
  execSync(`git clone --depth 1 --branch ${ref} ${repoUrl} "${tmpDir}"`, {
    stdio: 'ignore',
    timeout: 30_000,
  })
  
  return tmpDir
}

/**
 * 删除临时目录
 * @param {string} dir
 */
export function cleanupClone(dir) {
  if (existsSync(dir)) {
    execSync(`rm -rf "${dir}"`, { stdio: 'ignore' })
  }
}

/**
 * 从远端仓库列出可用的 Skill
 * @param {import('./source-parser.mjs').SourceInfo} sourceInfo
 * @returns {Promise<Array<{name:string, description:string, path:string}>>}
 */
export async function listRemoteSkills(sourceInfo) {
  const tmpDir = cloneRepo(sourceInfo.repoUrl, sourceInfo.ref)
  try {
    const skillsDir = join(tmpDir, 'skills')
    if (!existsSync(skillsDir)) return []
    
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const entries = readdirSync(skillsDir, { withFileTypes: true })
    const results = []
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const mcpPath = join(skillsDir, entry.name, 'mcp.json')
      const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
      
      if (!existsSync(mcpPath)) continue
      
      let description = ''
      // 优先从 SKILL.md 取描述
      if (existsSync(skillMdPath)) {
        const md = readFileSync(skillMdPath, 'utf-8').slice(0, 500)
        const frontmatter = md.match(/^---\n([\s\S]*?)\n---/)
        if (frontmatter) {
          const descMatch = frontmatter[1].match(/description:\s*(.+)/)
          if (descMatch) description = descMatch[1].trim()
        }
      }
      // 其次从 mcp.json 取描述
      if (!description) {
        try {
          const mcp = JSON.parse(readFileSync(mcpPath, 'utf-8'))
          description = (mcp.apis || []).map(a => a.description).filter(Boolean).join('; ').slice(0, 200)
        } catch {}
      }
      
      results.push({
        name: entry.name,
        description: description || entry.name,
        path: entry.name,
      })
    }
    
    return results
  } finally {
    cleanupClone(tmpDir)
  }
}
