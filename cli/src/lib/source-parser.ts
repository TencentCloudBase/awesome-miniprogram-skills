// ── 来源解析 ──
// 支持: GitHub shorthand (owner/repo) / 完整URL / 本地路径

import { existsSync } from 'node:fs'
import { normalize } from 'node:path'
import type { SourceInfo } from '../types.js'

/**
 * 解析并验证来源
 */
export function parseSource(source: string): SourceInfo {
  if (!source || typeof source !== 'string') {
    throw new Error('来源不能为空')
  }

  const trimmed = source.trim()

  // 1. GitHub shorthand: owner/repo
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

  // 2. 完整 URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('git@')) {
    return {
      type: 'url',
      original: trimmed,
      repoUrl: trimmed,
    }
  }

  // 3. 本地路径
  if (existsSync(trimmed)) {
    return {
      type: 'local',
      original: trimmed,
      localPath: normalize(trimmed),
    }
  }

  throw new Error(`无法解析来源 "${trimmed}"。\n支持: GitHub shorthand (owner/repo) / URL / 本地路径`)
}
