// test/source-parser.test.ts
// 测试来源解析模块

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { parseSource, loadRegistry } from '../src/lib/source-parser.js'

describe('parseSource', () => {
  it('解析 GitHub shorthand', () => {
    const r = parseSource('owner/repo')
    assert.equal(r.type, 'github')
    assert.equal(r.repoName, 'owner/repo')
    assert.equal(r.repoUrl, 'https://github.com/owner/repo.git')
  })

  it('解析注册表名称', () => {
    const r = parseSource('awesome-miniprogram')
    assert.equal(r.type, 'registry')
    assert.ok(r.repoName)
  })

  it('解析 URL', () => {
    const r = parseSource('https://github.com/foo/bar.git')
    assert.equal(r.type, 'url')
    assert.equal(r.repoUrl, 'https://github.com/foo/bar.git')
  })

  it('解析 git URL', () => {
    const r = parseSource('git@github.com:foo/bar.git')
    assert.equal(r.type, 'url')
  })

  it('空输入抛出异常', () => {
    assert.throws(() => parseSource(''), /不能为空/)
  })

  it('无效输入抛出异常', () => {
    assert.throws(() => parseSource('!!!invalid!!!'), /无法解析/)
  })

  it('符号注入被过滤', () => {
    assert.throws(() => parseSource('../../../etc/passwd'), /无法解析/)
  })
})

describe('loadRegistry', () => {
  it('返回有效结构', () => {
    const reg = loadRegistry()
    assert.ok(Array.isArray(reg.repositories))
    assert.ok(reg.repositories.length > 0)
  })

  it('包含 awesome-miniprogram', () => {
    const reg = loadRegistry()
    const repo = reg.repositories.find(r => r.name === 'awesome-miniprogram')
    assert.ok(repo)
    assert.equal(repo.repo, 'TencentCloudBase/awesome-miniprogram-skills')
  })
})
