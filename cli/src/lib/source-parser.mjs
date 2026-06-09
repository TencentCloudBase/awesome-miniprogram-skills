// ── 来源解析 ──
// 将用户输入的 source 解析为可获取的来源信息
// 支持: registry名 / GitHub shorthand / 完整URL / 本地路径

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI_ROOT = join(__dirname, '..', '..')

/**
 * @typedef {Object} SourceInfo
 * @property {'registry'|'github'|'url'|'local'} type
 * @property {string} original - 用户输入的原始字符串
 * @property {string} repoUrl - 用于 git clone 的 URL
 * @property {string} [repoName] - owner/repo
 * @property {string} [ref] - 分支或 tag
 * @property {string} [localPath] - 本地路径
 */

/**
 * 解析用户输入的来源
 * @param {string} source
 * @returns {SourceInfo}
 */
export function parseSource(source) {
  // 1. 检查是否是注册表名
  const reg = loadRegistry()
  const registryEntry = reg.repositories.find(
    r => r.name === source || r.repo === source
  )
  if (registryEntry) {
    return {
      type: 'registry',
      original: source,
      repoUrl: `https://github.com/${registryEntry.repo}.git`,
      repoName: registryEntry.repo,
      ref: registryEntry.ref || 'main',
      match: registryEntry.match || 'skills/*',
    }
  }

  // 2. GitHub shorthand: owner/repo
  const ghMatch = source.match(/^([\w.-]+)\/([\w.-]+)$/)
  if (ghMatch) {
    return {
      type: 'github',
      original: source,
      repoUrl: `https://github.com/${source}.git`,
      repoName: source,
      ref: 'main',
    }
  }

  // 3. 完整 URL (git URL)
  if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('git@')) {
    return {
      type: 'url',
      original: source,
      repoUrl: source,
    }
  }

  // 4. 本地路径
  if (existsSync(source)) {
    return {
      type: 'local',
      original: source,
      localPath: source,
    }
  }

  throw new Error(`无法解析来源: "${source}"。请使用 GitHub shorthand (owner/repo)、完整 URL、注册表名称、或本地路径。`)
}

/**
 * 加载注册表
 */
function loadRegistry() {
  const registryPath = join(CLI_ROOT, 'references', 'registry.json')
  if (!existsSync(registryPath)) {
    return { version: 1, repositories: [] }
  }
  return JSON.parse(readFileSync(registryPath, 'utf-8'))
}

/**
 * 从来源列出可获取的 Skill
 * @param {SourceInfo} sourceInfo
 * @returns {Promise<Array<{name:string, description:string}>>}
 */
export async function listSkillsFromSource(sourceInfo) {
  if (sourceInfo.type === 'registry') {
    return listRegistrySkills(sourceInfo)
  }
  const { listRemoteSkills } = await import('./git.mjs')
  return listRemoteSkills(sourceInfo)
}

/**
 * 从注册表列出已知 Skill
 */
async function listRegistrySkills(sourceInfo) {
  const reg = loadRegistry()
  const entry = reg.repositories.find(
    r => r.name === sourceInfo.original || r.repo === sourceInfo.original
  )
  if (!entry) return []
  return entry.skills || []
}
