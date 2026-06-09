// ── 锁文件管理 ──
// 类似 vercel-labs/skills 的 skills-lock.json，追踪已安装 Skill 版本

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const LOCK_FILE = 'skills-lock.json'

/**
 * @typedef {Object} LockEntry
 * @property {string} name - Skill 名称
 * @property {string} source - 来源（repo URL）
 * @property {string} [hash] - 目录哈希
 * @property {string} [installedAt] - 安装时间
 */

/**
 * 读取锁文件
 * @param {string} projectPath
 * @returns {{version:number, skills:Array<LockEntry>}}
 */
export function readLock(projectPath) {
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
 * @param {string} projectPath
 * @param {Array<LockEntry>} skills
 */
export function writeLock(projectPath, skills) {
  const lockPath = join(projectPath, LOCK_FILE)
  writeFileSync(lockPath, JSON.stringify({ version: 1, skills }, null, 2) + '\n')
}

/**
 * 添加一条锁记录
 * @param {string} projectPath
 * @param {LockEntry} entry
 */
export function addLockEntry(projectPath, entry) {
  const lock = readLock(projectPath)
  const existing = lock.skills.find(s => s.name === entry.name)
  if (existing) {
    Object.assign(existing, entry, { installedAt: new Date().toISOString() })
  } else {
    lock.skills.push({ ...entry, installedAt: new Date().toISOString() })
  }
  writeLock(projectPath, lock.skills)
}

/**
 * 删除锁记录
 * @param {string} projectPath
 * @param {string} name
 */
export function removeLockEntry(projectPath, name) {
  const lock = readLock(projectPath)
  lock.skills = lock.skills.filter(s => s.name !== name)
  writeLock(projectPath, lock.skills)
}
