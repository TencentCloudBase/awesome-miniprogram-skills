// ── Git 操作 ──
// 使用 GitHub Trees API 列出远程 Skill（避免 clone），仅在安装时 clone

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync, Dirent } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID, createHash } from 'node:crypto'
import type { SourceInfo } from '../types.js'

/**
 * 使用 GitHub Trees API 列出远程仓库 skills/ 下的所有 Skill
 * 避免 git clone，轻量快速
 */
export async function listRemoteSkills(info: SourceInfo): Promise<Array<{ name: string; path: string }>> {
  const { repoName, ref } = info
  if (!repoName) throw new Error('GitHub repo name required')

  const token = getGitHubToken()
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'mp-skills-cli',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }

  // 获取 skills/ 目录的 tree
  const url = `https://api.github.com/repos/${repoName}/git/trees/${ref}?recursive=1`
  const response = await fetch(url, { headers })

  if (!response.ok) {
    // API 限流或无权，降级到 git clone
    console.log('  GitHub API 不可用，降级到 git clone...')
    return listRemoteSkillsFallback(info)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await response.json()
  const skills = new Set<string>()

  // 解析 tree: 找 skills/<name>/mcp.json 路径
  for (const item of data.tree || []) {
    const match = item.path.match(/^skills\/([^/]+)\/mcp\.json$/)
    if (match) {
      skills.add(match[1])
    }
  }

  return [...skills].map(name => ({ name, path: name }))
}

/**
 * fallback: git clone 方式发现
 */
async function listRemoteSkillsFallback(info: SourceInfo): Promise<Array<{ name: string; path: string }>> {
  const tmpDir = cloneRepo(info.repoUrl!, info.ref)
  try {
    const skillsDir = join(tmpDir, 'skills')
    if (!existsSync(skillsDir)) return []

    const entries = readdirSync(skillsDir, { withFileTypes: true })
    return entries
      .filter((e: Dirent) => e.isDirectory() && existsSync(join(skillsDir, e.name, 'mcp.json')))
      .map((e: Dirent) => ({ name: e.name, path: e.name }))
  } finally {
    cleanupClone(tmpDir)
  }
}

/**
 * 下载并读取远程文件的文本内容
 */
export async function fetchRemoteFile(info: SourceInfo, filePath: string): Promise<string | null> {
  const { repoName, ref } = info
  if (!repoName) return null

  const url = `https://raw.githubusercontent.com/${repoName}/${ref}/${filePath}`
  const token = getGitHubToken()
  const headers: Record<string, string> = {
    'User-Agent': 'mp-skills-cli',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    const response = await fetch(url, { headers })
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

/**
 * 计算目录的哈希（用于版本追踪）
 */
export function hashDirectory(dir: string): string {
  const hash = createHash('sha256')

  function walk(d: string): void {
    const entries = readdirSync(d).sort()
    for (const entry of entries) {
      const fullPath = join(d, entry)
      const st = statSync(fullPath)
      if (st.isDirectory()) {
        hash.update(`dir:${entry}`)
        walk(fullPath)
      } else {
        hash.update(`file:${entry}:${st.size}:${st.mtimeMs}`)
      }
    }
  }

  if (existsSync(dir)) walk(dir)
  return hash.digest('hex').slice(0, 16)
}

/**
 * 获取 GitHub token（环境变量或 gh CLI）
 */
function getGitHubToken(): string {
  // 环境变量优先
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN

  // 尝试 gh CLI
  try {
    return execSync('gh auth token', { stdio: 'pipe', timeout: 5000 })
      .toString().trim()
  } catch {
    return ''
  }
}

/**
 * Clone 仓库到临时目录
 */
export function cloneRepo(repoUrl: string, ref: string = 'main'): string {
  const tmpDir = join(tmpdir(), 'mp-skills-' + randomUUID().slice(0, 8))
  mkdirSync(tmpDir, { recursive: true })

  execSync(`git clone --depth 1 --branch ${ref} "${repoUrl}" "${tmpDir}"`, {
    stdio: 'ignore',
    timeout: 30_000,
  })

  return tmpDir
}

/**
 * 清理克隆目录
 */
export function cleanupClone(dir: string): void {
  if (dir && existsSync(dir)) {
    try {
      execSync(`rm -rf "${dir}"`, { stdio: 'ignore' })
    } catch { /* ignore */ }
  }
}
