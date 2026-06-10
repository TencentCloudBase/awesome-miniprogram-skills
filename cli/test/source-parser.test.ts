// test/source-parser.test.ts

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { parseSource } from '../src/lib/source-parser.js'

describe('parseSource', () => {
  it('解析 GitHub shorthand', () => {
    const r = parseSource('owner/repo')
    assert.equal(r.type, 'github')
    assert.equal(r.repoName, 'owner/repo')
    assert.equal(r.repoUrl, 'https://github.com/owner/repo.git')
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

  it('解析本地路径', () => {
    const r = parseSource('.')
    assert.equal(r.type, 'local')
    assert.ok(r.localPath)
  })

  it('空输入抛出异常', () => {
    assert.throws(() => parseSource(''), /不能为空/)
  })

  it('无效输入抛出异常', () => {
    assert.throws(() => parseSource('!!!invalid!!!'), /无法解析/)
  })

  it('路径穿越被过滤', () => {
    assert.throws(() => parseSource('../../../etc/passwd'), /无法解析/)
  })
})
