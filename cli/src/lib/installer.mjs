// ── 安装器 ──
// 将 Skill 拷贝到目标项目，并注入 app.json / project.config.json 配置

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, cpSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'

/**
 * 安装一个 Skill 到目标项目
 * @param {string} skillPath - 本地 Skill 目录路径
 * @param {string} projectPath - 目标小程序项目根目录
 * @param {object} [opts]
 * @param {string} [opts.skillName] - 覆盖 Skill 名称
 */
export function installSkill(skillPath, projectPath, opts = {}) {
  const skillName = opts.skillName || skillPath.split('/').pop()
  const targetSkillDir = join(projectPath, 'skills', skillName)
  const appJsonPath = join(projectPath, 'miniprogram', 'app.json')
  const projectConfigPath = join(projectPath, 'project.config.json')

  console.log(`📦 安装 Skill: ${skillName}`)

  // 1. 拷贝 Skill 目录
  if (existsSync(targetSkillDir)) {
    console.log(`   ⚠️  ${skillName} 已存在，将被覆盖`)
    cpSync(skillPath, targetSkillDir, { recursive: true, force: true })
  } else {
    mkdirSync(targetSkillDir, { recursive: true })
    cpSync(skillPath, targetSkillDir, { recursive: true })
  }
  console.log(`   ✓ skills/${skillName}/ 已创建`)

  // 2. 更新 app.json
  if (existsSync(appJsonPath)) {
    injectAppJson(appJsonPath, skillName, skillPath)
    console.log(`   ✓ miniprogram/app.json 已更新`)
  } else {
    console.log(`   ⚠️  未找到 miniprogram/app.json，跳过配置注入`)
  }

  // 3. 更新 project.config.json
  if (existsSync(projectConfigPath)) {
    injectProjectConfig(projectConfigPath)
    console.log(`   ✓ project.config.json 已更新`)
  }

  return { skillName, targetDir: targetSkillDir }
}

/**
 * 向 app.json 注入 agent.skills 和 subPackages 配置
 */
function injectAppJson(appJsonPath, skillName, skillPath) {
  const app = JSON.parse(readFileSync(appJsonPath, 'utf-8'))

  // 确保 lazyCodeLoading
  if (!app.lazyCodeLoading) {
    app.lazyCodeLoading = 'requiredComponents'
  }

  // 确保 subPackages 包含 skills
  if (!Array.isArray(app.subPackages)) {
    app.subPackages = []
  }
  const hasSkillsPkg = app.subPackages.some(
    p => p.root === 'skills' || (typeof p === 'string' && p === 'skills')
  )
  if (!hasSkillsPkg) {
    app.subPackages.push({
      root: 'skills',
      name: 'skills',
      pages: [],
      independent: true,
    })
  }

  // 确保 agent 和 agent.skills
  if (!app.agent) app.agent = {}
  if (!Array.isArray(app.agent.skills)) app.agent.skills = []

  // 读取 mcp.json 获取描述
  const mcpPath = join(skillPath, 'mcp.json')
  let description = skillName
  let apiCount = 0
  if (existsSync(mcpPath)) {
    try {
      const mcp = JSON.parse(readFileSync(mcpPath, 'utf-8'))
      apiCount = (mcp.apis || []).length
      description = (mcp.apis || []).map(a => a.description).filter(Boolean).join('、').slice(0, 200) || skillName
    } catch {}
  }

  // 检查是否已注册
  const existing = app.agent.skills.find(s => s.path === `skills/${skillName}`)
  if (existing) {
    existing.description = description
  } else {
    app.agent.skills.push({
      name: skillName.replace(/-skill$/, ''),
      description: description,
      path: `skills/${skillName}`,
    })
  }

  writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n')
}

/**
 * 向 project.config.json 注入 packOptions.include
 */
function injectProjectConfig(configPath) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))

  if (!config.packOptions) config.packOptions = {}
  if (!Array.isArray(config.packOptions.include)) config.packOptions.include = []

  const hasSkills = config.packOptions.include.some(
    i => i.type === 'folder' && i.value === 'skills'
  )
  if (!hasSkills) {
    config.packOptions.include.unshift({ type: 'folder', value: 'skills' })
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
}
