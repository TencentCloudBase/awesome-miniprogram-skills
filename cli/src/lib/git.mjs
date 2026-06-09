// ── Git 操作 ──
// 使用 GitHub Trees API 列出远程 Skill（避免 clone），仅在安装时 clone

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir, homedir } from 'node:os'
import { randomUUID, createHash } from 'node:crypto'

/**
 * @typedef {Object} SourceInfo
 * @property {'registry'|'github'|'url'|'local'} type
 * @property {string} original
 * @property {string} [repoUrl]
 * @property {string} [repoName]
 * @property {string} [ref]
 * @property {string} [localPath]
 */

/**
 * 使用 GitHub Trees API 列出远程仓库 skills/ 下的所有 Skill
 * 避免 git clone，轻量快速
 * @param {SourceInfo} info
 * @returns {Promise<Array<{name:string, path:string}>>}
 */
export async function listRemoteSkills(info) {
  const { repoName, ref } = info
  if (!repoName) throw new Error('GitHub repo name required')

  const token = getGitHubToken()
  const headers = {
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

  const data = await response.json()
  const skills = new Set()

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
async function listRemoteSkillsFallback(info) {
  const tmpDir = cloneRepo(info.repoUrl, info.ref)
  try {
    const skillsDir = join(tmpDir, 'skills')
    if (!existsSync(skillsDir)) return []

    const { readdirSync } = await import('node:fs')
    const entries = readdirSync(skillsDir, { withFileTypes: true })
    return entries
      .filter(e => e.isDirectory() && existsSync(join(skillsDir, e.name, 'mcp.json')))
      .map(e => ({ name: e.name, path: e.name }))
  } finally {
    cleanupClone(tmpDir)
  }
}

/**
 * 下载并读取远程文件的文本内容
 * @param {SourceInfo} info
 * @param {string} filePath - 仓库内路径，如 "skills/drink-skill/mcp.json"
 * @returns {Promise<string|null>}
 */
export async function fetchRemoteFile(info, filePath) {
  const { repoName, ref } = info
  if (!repoName) return null

  const url = `https://raw.githubusercontent.com/${repoName}/${ref}/${filePath}`
  const token = getGitHubToken()
  const headers = {
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
 * @param {string} dir
 * @returns {string}
 */
export function hashDirectory(dir) {
  const hash = createHash('sha256')
  
  function walk(d) {
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
function getGitHubToken() {
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
 * @param {string} repoUrl
 * @param {string} [ref='main']
 * @returns {string}
 */
export function cloneRepo(repoUrl, ref = 'main') {
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
 * @param {string} dir
 */
export function cleanupClone(dir) {
  if (dir && existsSync(dir)) {
    try {
      execSync(`rm -rf "${dir}"`, { stdio: 'ignore' })
    } catch {}
  }
}
