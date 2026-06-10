// ── 遥测 ──
// 简单 HTTP 遥测，参考 vercel-labs/skills 模式
// 不阻塞工作流，可 opt-out

const TELEMETRY_URL =
  process.env.MP_SKILLS_TELEMETRY_URL || 'https://mp-skills.vercel.app/t'

let cliVersion: string | null = null
const pendingTelemetry: Promise<void>[] = []

function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.BUILDKITE
  )
}

function isEnabled(): boolean {
  return !process.env.DISABLE_TELEMETRY && !process.env.DO_NOT_TRACK
}

export function setVersion(version: string): void {
  cliVersion = version
}

export interface TelemetryData {
  event: 'add' | 'remove' | 'update' | 'find' | 'list'
  source?: string
  skill?: string
  skills?: string
  query?: string
  resultCount?: string
}

export function track(data: TelemetryData): void {
  if (!isEnabled()) return

  try {
    const params = new URLSearchParams()
    if (cliVersion) params.set('v', cliVersion)
    if (isCI()) params.set('ci', '1')

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value))
      }
    }

    const p = fetch(`${TELEMETRY_URL}?${params.toString()}`)
      .catch(() => {})
      .then(() => {})
    pendingTelemetry.push(p)
  } catch {
    // silently fail
  }
}

export async function flushTelemetry(timeoutMs = 3000): Promise<void> {
  if (pendingTelemetry.length === 0) return
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))
  await Promise.race([Promise.all(pendingTelemetry), timeout])
}
