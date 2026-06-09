// test/installer.test.ts
// 测试安装器模块

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { mkdirSync, writeFileSync, existsSync, readFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { installSkill } from '../src/lib/installer.js'
import { readLock } from '../src/lib/lock-file.js'

function createFixture() {
  const tmp = mkdtempSync(join(tmpdir(), 'mp-skills-test-'))

  // fake project
  const proj = join(tmp, 'project')
  mkdirSync(join(proj, 'miniprogram'), { recursive: true })
  writeFileSync(
    join(proj, 'miniprogram', 'app.json'),
    JSON.stringify({
      pages: ['pages/index/index'],
      window: {},
    }),
  )
  writeFileSync(join(proj, 'project.config.json'), JSON.stringify({ appid: 'test' }))

  // fake skill
  const skill = join(tmp, 'my-skill')
  mkdirSync(join(skill, 'apis'), { recursive: true })
  mkdirSync(join(skill, 'components'), { recursive: true })
  writeFileSync(
    join(skill, 'mcp.json'),
    JSON.stringify({
      apis: [{ name: 'hello', description: '打招呼' }],
    }),
  )

  return { proj, skill }
}

describe('installSkill', () => {
  it('拷贝 Skill 到目标项目', () => {
    const { proj, skill } = createFixture()
    installSkill(skill, proj, { skillName: 'my-skill' })

    const target = join(proj, 'skills', 'my-skill')
    assert.ok(existsSync(target), 'Skill 目录应存在')
    assert.ok(existsSync(join(target, 'mcp.json')), 'mcp.json 应存在')
  })

  it('更新 app.json agent.skills', () => {
    const { proj, skill } = createFixture()
    installSkill(skill, proj, { skillName: 'my-skill' })

    const app = JSON.parse(readFileSync(join(proj, 'miniprogram', 'app.json'), 'utf-8'))
    assert.ok(app.agent?.skills, 'agent.skills 应存在')
    assert.ok(app.agent.skills.some((s: any) => s.path === 'skills/my-skill'))
    assert.ok(app.lazyCodeLoading)
  })

  it('添加 subPackages', () => {
    const { proj, skill } = createFixture()
    installSkill(skill, proj, { skillName: 'my-skill' })

    const app = JSON.parse(readFileSync(join(proj, 'miniprogram', 'app.json'), 'utf-8'))
    assert.ok(app.subPackages.some((p: any) => p.root === 'skills'))
  })

  it('更新 project.config.json packOptions', () => {
    const { proj, skill } = createFixture()
    installSkill(skill, proj, { skillName: 'my-skill' })

    const config = JSON.parse(readFileSync(join(proj, 'project.config.json'), 'utf-8'))
    assert.ok(config.packOptions?.include?.some((i: any) => i.value === 'skills'))
  })

  it('写入锁文件', () => {
    const { proj, skill } = createFixture()
    installSkill(skill, proj, { skillName: 'my-skill', source: 'test' })

    const lock = readLock(proj)
    assert.ok(lock.skills.some((s: any) => s.name === 'my-skill'))
  })
})
