// ── 工具函数 ──

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CLI_ROOT = join(__dirname, '..', '..')

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
 * Console 输出
 */
export function log(msg) { console.log(msg) }
export function warn(msg) { console.log(`  ⚠️  ${msg}`) }
export function ok(msg) { console.log(`  ✓ ${msg}`) }
export function title(msg) { console.log(`\n${msg}`) }
