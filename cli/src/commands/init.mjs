// ── init 命令 ──
// 在当前目录创建一个空的 Skill 模板

import { existsSync, mkdirSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { log, ok, warn } from '../lib/utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', '..', 'templates')

export async function initCommand(name) {
  const targetDir = resolve(name)
  
  if (existsSync(targetDir)) {
    warn(`目录已存在: ${name}`)
    return
  }

  const skeletonDir = join(TEMPLATES_DIR, 'skill-skeleton')
  if (!existsSync(skeletonDir)) {
    warn('未找到 Skill 模板')
    return
  }

  mkdirSync(targetDir, { recursive: true })
  cpSync(skeletonDir, targetDir, { recursive: true })
  
  log(`\n📦 已创建 Skill 模板: ${name}`)
  ok(`skills/${name}/`)
  ok(`  mcp.json  — 定义 API 接口`)
  ok(`  SKILL.md  — 编排业务流程`)
  ok(`  index.js  — 注册入口`)
  ok(`  apis/     — 原子接口实现`)
  ok(`  components/  — 原子组件`)
  log(`\n安装到项目: mp-skills add ./${name}`)
}
