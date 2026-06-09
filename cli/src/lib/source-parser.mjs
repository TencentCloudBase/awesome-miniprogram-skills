// ── 来源解析 + 注册表 ──
// 支持: registry名 / GitHub shorthand / 完整URL / 本地路径
// 输入消毒防路径穿越

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI_ROOT = join(__dirname, '..', '..')

/**
 * @typedef {'registry'|'github'|'url'|'local'} SourceType
 * @typedef {Object} SourceInfo
 * @property {SourceType} type
 * @property {string} original
 * @property {string} [repoUrl]
 * @property {string} [repoName] - owner/repo
 * @property {string} [ref]
 * @property {string} [match]
 * @property {string} [localPath]
 */

const SAFE_NAME_RE = /^[\w.-]+$/

/**
 * 解析并验证来源
 * @param {string} source
 * @returns {SourceInfo}
 */
export function parseSource(source) {
  if (!source || typeof source !== 'string') {
    throw new Error('来源不能为空')
  }

  const trimmed = source.trim()

  // 1. 注册表
  const reg = loadRegistry()
  const registryEntry = reg.repositories.find(
    r => r.name === trimmed || r.repo === trimmed
  )
  if (registryEntry) {
    return {
      type: 'registry',
      original: trimmed,
      repoUrl: `https://github.com/${registryEntry.repo}.git`,
      repoName: registryEntry.repo,
      ref: registryEntry.ref || 'main',
      match: registryEntry.match || 'skills/*',
    }
  }

  // 2. GitHub shorthand: owner/repo
  if (SAFE_NAME_RE.test(trimmed) && trimmed.includes('/')) {
    const parts = trimmed.split('/')
    if (parts.length === 2) {
      const [owner, repo] = parts
      if (SAFE_NAME_RE.test(owner) && SAFE_NAME_RE.test(repo)) {
        return {
          type: 'github',
          original: trimmed,
          repoUrl: `https://github.com/${owner}/${repo}.git`,
          repoName: `${owner}/${repo}`,
          ref: 'main',
        }
      }
    }
  }

  // 3. 完整 URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('git@')) {
    return {
      type: 'url',
      original: trimmed,
      repoUrl: trimmed,
    }
  }

  // 4. 本地路径
  if (existsSync(trimmed)) {
    const normalized = normalize(trimmed)
    return {
      type: 'local',
      original: trimmed,
      localPath: normalized,
    }
  }

  throw new Error(`无法解析来源 "${trimmed}"。\n支持: 注册表名 / GitHub shorthand (owner/repo) / URL / 本地路径`)
}

/**
 * 加载注册表
 * @returns {{version:number, repositories:Array}}
 */
export function loadRegistry() {
  const registryPath = join(CLI_ROOT, 'references', 'registry.json')
  if (!existsSync(registryPath)) {
    return { version: 1, repositories: [] }
  }
  return JSON.parse(readFileSync(registryPath, 'utf-8'))
}

/**
 * 获取注册表 repo 信息
 * @param {string} name
 * @returns {{repo:string, ref:string, match:string, skills:Array}|undefined}
 */
export function getRegistryRepo(name) {
  const reg = loadRegistry()
  return reg.repositories.find(r => r.name === name || r.repo === name)
}
