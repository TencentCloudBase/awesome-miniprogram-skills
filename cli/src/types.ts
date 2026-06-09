// ── 共享类型定义 ──

export type SourceType = 'registry' | 'github' | 'url' | 'local'

export interface SourceInfo {
  type: SourceType
  original: string
  repoUrl?: string
  repoName?: string
  ref?: string
  match?: string
  localPath?: string
  skillName?: string
}

export interface LockEntry {
  name: string
  source: string
  hash?: string
  installedAt?: string
}

export interface RegistryRepo {
  name: string
  repo: string
  ref?: string
  match?: string
  skills?: Array<{ name: string; description: string }>
}

export interface Registry {
  version: number
  repositories: RegistryRepo[]
}

export interface SkillInfo {
  name: string
  description?: string
  path: string
}
