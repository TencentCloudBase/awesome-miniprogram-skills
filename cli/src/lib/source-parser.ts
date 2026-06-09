// ── 来源解析 + 注册表 ──
// 支持: registry名 / GitHub shorthand / 完整URL / 本地路径
// 输入消毒防路径穿越

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SourceInfo, Registry, RegistryRepo } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLI_ROOT = join(__dirname, '..', '..')

const SAFE_NAME_RE = /^[\w.-]+$/

/**
 * 解析并验证来源
 */
export function parseSource(source: string): SourceInfo {
  if (!source || typeof source !== 'string') {
    throw new Error('来源不能为空')
  }

  const trimmed = source.trim()

  // 2. 先检查 GitHub shorthand (owner/repo) — 在 registry 之前，因为用户输入可能未注册
  const ghMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/)
  if (ghMatch) {
    return {
      type: 'github',
      original: trimmed,
      repoUrl: `https://github.com/${ghMatch[1]}/${ghMatch[2]}.git`,
      repoName: `${ghMatch[1]}/${ghMatch[2]}`,
      ref: 'main',
    }
  }

  // 1. 注册表
  const reg = loadRegistry()
  const registryEntry = reg.repositories.find((r) => r.name === trimmed || r.repo === trimmed)
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
 */
export function loadRegistry(): Registry {
  const registryPath = join(CLI_ROOT, 'references', 'registry.json')
  if (!existsSync(registryPath)) {
    return { version: 1, repositories: [] }
  }
  return JSON.parse(readFileSync(registryPath, 'utf-8'))
}

/**
 * 获取注册表 repo 信息
 */
export function getRegistryRepo(name: string): RegistryRepo | undefined {
  const reg = loadRegistry()
  return reg.repositories.find((r) => r.name === name || r.repo === name)
}
