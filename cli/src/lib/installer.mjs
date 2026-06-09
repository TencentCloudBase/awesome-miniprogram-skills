// ── 安装器 ──
// 拷贝 Skill，注入 app.json / project.config.json，写入锁文件

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import { hashDirectory } from './git.mjs'
import { addLockEntry, removeLockEntry } from './lock-file.mjs'

/**
 * 安装 Skill
 * @param {string} skillPath
 * @param {string} projectPath
 * @param {object} [opts]
 * @param {string} [opts.skillName]
 * @param {string} [opts.source] - 来源信息
 */
export function installSkill(skillPath, projectPath, opts = {}) {
  const skillName = opts.skillName || skillPath.split('/').pop()
  const targetDir = join(projectPath, 'skills', skillName)

  console.log(`\n📦 安装 Skill: ${skillName}`)

  // 1. 拷贝
  if (existsSync(targetDir)) {
    console.log(`   ⚠️  ${skillName} 已存在，覆盖`)
    cpSync(skillPath, targetDir, { recursive: true, force: true })
  } else {
    mkdirSync(targetDir, { recursive: true })
    cpSync(skillPath, targetDir, { recursive: true })
  }
  console.log(`   ✓ skills/${skillName}/`)

  // 2. 更新 app.json
  const appJsonPath = join(projectPath, 'miniprogram', 'app.json')
  if (existsSync(appJsonPath)) {
    injectAppJson(appJsonPath, skillName, skillPath)
  } else {
    console.log('   ⚠️  未找到 miniprogram/app.json')
  }

  // 3. 更新 project.config.json
  const projectConfigPath = join(projectPath, 'project.config.json')
  if (existsSync(projectConfigPath)) {
    injectProjectConfig(projectConfigPath)
  }

  // 4. 写入锁文件
  addLockEntry(projectPath, {
    name: skillName,
    source: opts.source || '',
    hash: hashDirectory(targetDir),
  })
  
  console.log('   ✓ 已记录版本')
  return { skillName, targetDir }
}

/**
 * 注入 app.json
 */
function injectAppJson(appJsonPath, skillName, skillPath) {
  const app = JSON.parse(readFileSync(appJsonPath, 'utf-8'))

  if (!app.lazyCodeLoading) app.lazyCodeLoading = 'requiredComponents'
  if (!app.agent) app.agent = {}
  if (!Array.isArray(app.agent.skills)) app.agent.skills = []

  // subPackages
  if (!Array.isArray(app.subPackages)) app.subPackages = []
  if (!app.subPackages.some(p => p.root === 'skills')) {
    app.subPackages.push({
      root: 'skills', name: 'skills', pages: [], independent: true,
    })
  }

  // 取描述
  const mcpPath = join(skillPath, 'mcp.json')
  let description = skillName
  if (existsSync(mcpPath)) {
    try {
      const mcp = JSON.parse(readFileSync(mcpPath, 'utf-8'))
      description = (mcp.apis || []).map(a => a.description).filter(Boolean).join('、').slice(0, 200) || skillName
    } catch {}
  }

  const existing = app.agent.skills.find(s => s.path === `skills/${skillName}`)
  if (existing) {
    existing.description = description
  } else {
    app.agent.skills.push({
      name: skillName.replace(/-skill$/, '').replace(/-tracker$/, ''),
      description,
      path: `skills/${skillName}`,
    })
  }

  writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n')
}

/**
 * 注入 project.config.json
 */
function injectProjectConfig(configPath) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  if (!config.packOptions) config.packOptions = {}
  if (!Array.isArray(config.packOptions.include)) config.packOptions.include = []
  if (!config.packOptions.include.some(i => i.type === 'folder' && i.value === 'skills')) {
    config.packOptions.include.unshift({ type: 'folder', value: 'skills' })
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
}
