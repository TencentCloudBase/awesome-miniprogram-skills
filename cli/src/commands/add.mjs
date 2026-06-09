// ── add 命令 ──
// 从任意来源安装 Skill 到目标小程序项目

import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseSource, listSkillsFromSource } from '../lib/source-parser.mjs'
import { cloneRepo, cleanupClone } from '../lib/git.mjs'
import { installSkill } from '../lib/installer.mjs'
import { log, warn, ok, title } from '../lib/utils.mjs'

/**
 * add 命令入口
 * @param {string} source - 来源（registry名/GitHub shorthand/URL/本地路径）
 * @param {object} opts - 选项
 */
export async function addCommand(source, opts) {
  try {
    const sourceInfo = parseSource(source)

    // ── --list 模式：只列出不安装 ──
    if (opts.list) {
      title(`📋 来源: ${sourceInfo.original}`)
      const skills = await listSkillsFromSource(sourceInfo)
      if (skills.length === 0) {
        log('   没有找到 Skill')
        return
      }
      for (const s of skills) {
        log(`  ${s.name}  — ${s.description || '无描述'}`)
      }
      log(`\n共 ${skills.length} 个 Skill`)
      return
    }

    // ── 确定目标项目路径 ──
    const projectPath = resolve('.')
    const appJsonPath = join(projectPath, 'miniprogram', 'app.json')
    if (!existsSync(appJsonPath)) {
      warn('当前目录不是小程序项目（未找到 miniprogram/app.json）')
      log('请在含有 miniprogram/ 目录的项目根目录运行')
      return
    }

    // ── 获取 Skill ──
    let skillLocalPath
    let tmpDir

    if (sourceInfo.type === 'local') {
      skillLocalPath = sourceInfo.localPath
    } else {
      if (!opts.yes) {
        log(`将从 ${sourceInfo.repoUrl} 获取 Skill...`)
      }
      tmpDir = cloneRepo(sourceInfo.repoUrl, sourceInfo.ref)
      const skillsDir = join(tmpDir, 'skills')

      if (!existsSync(skillsDir)) {
        warn('仓库中未找到 skills/ 目录')
        cleanupClone(tmpDir)
        return
      }

      // --skill 指定特定 Skill
      if (opts.skill) {
        skillLocalPath = join(skillsDir, opts.skill)
        if (!existsSync(skillLocalPath)) {
          warn(`未找到 Skill "${opts.skill}"`)
          log(`可用: ${readdirSync(skillsDir).filter(f => !f.startsWith('.')).join(', ')}`)
          cleanupClone(tmpDir)
          return
        }
      }
      // --all 或交互选择
      else if (opts.all) {
        const entries = readdirSync(skillsDir, { withFileTypes: true })
          .filter(e => e.isDirectory() && existsSync(join(skillsDir, e.name, 'mcp.json')))
        for (const entry of entries) {
          installSkill(join(skillsDir, entry.name), projectPath)
        }
        log(`\n✅ 已安装 ${entries.length} 个 Skill`)
        cleanupClone(tmpDir)
        return
      }
      // 交互选择（简化版）
      else {
        const entries = readdirSync(skillsDir, { withFileTypes: true })
          .filter(e => e.isDirectory() && existsSync(join(skillsDir, e.name, 'mcp.json')))
        if (entries.length === 0) {
          warn('仓库中没有包含 mcp.json 的有效 Skill')
          cleanupClone(tmpDir)
          return
        }
        if (entries.length === 1) {
          skillLocalPath = join(skillsDir, entries[0].name)
        } else {
          // 自动选择第一个（命令行环境，非交互）
          log(`发现 ${entries.length} 个 Skill，安装第一个: ${entries[0].name}`)
          log(`使用 --all 安装全部，或 --skill <name> 指定`)
          skillLocalPath = join(skillsDir, entries[0].name)
        }
      }
    }

    // ── 安装 ──
    installSkill(skillLocalPath, projectPath)

    if (tmpDir) cleanupClone(tmpDir)
    
    log(`\n✅ 安装完成！`)
    log('   ✓ 小程序已具备 AI 能力')
    log('   📖 参考 docs/SKILL-DEV-GUIDE.md 开发你的 Skill')
    log('   🔍 运行 mp-skills validate . 进行静态校验')

  } catch (err) {
    console.error(`❌ ${err.message}`)
    process.exit(1)
  }
}
