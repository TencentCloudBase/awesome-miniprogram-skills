// ── 锁文件管理 ──
// 类似 vercel-labs/skills 的 skills-lock.json，追踪已安装 Skill 版本

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LockEntry } from '../types.js'

const LOCK_FILE = 'skills-lock.json'

/**
 * 读取锁文件
 */
export function readLock(projectPath: string): { version: number; skills: LockEntry[] } {
  const lockPath = join(projectPath, LOCK_FILE)
  if (!existsSync(lockPath)) {
    return { version: 1, skills: [] }
  }
  try {
    return JSON.parse(readFileSync(lockPath, 'utf-8'))
  } catch {
    return { version: 1, skills: [] }
  }
}

/**
 * 写入锁文件
 */
export function writeLock(projectPath: string, skills: LockEntry[]): void {
  const lockPath = join(projectPath, LOCK_FILE)
  writeFileSync(lockPath, JSON.stringify({ version: 1, skills }, null, 2) + '\n')
}

/**
 * 添加一条锁记录
 */
export function addLockEntry(projectPath: string, entry: LockEntry): void {
  const lock = readLock(projectPath)
  const existing = lock.skills.find((s) => s.name === entry.name)
  if (existing) {
    Object.assign(existing, entry, { installedAt: new Date().toISOString() })
  } else {
    lock.skills.push({ ...entry, installedAt: new Date().toISOString() })
  }
  writeLock(projectPath, lock.skills)
}

/**
 * 删除锁记录
 */
export function removeLockEntry(projectPath: string, name: string): void {
  const lock = readLock(projectPath)
  lock.skills = lock.skills.filter((s) => s.name !== name)
  writeLock(projectPath, lock.skills)
}
