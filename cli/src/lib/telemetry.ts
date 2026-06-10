// ── 遥测 ──
// 参考 CloudBase MCP（腾讯云灯塔 Beacon）的模式
// POST JSON 到 https://otheve.beacon.qq.com/analytics/v2_upload
//
// 隐私保护：
// - 可通过环境变量 MP_SKILLS_TELEMETRY_DISABLED=true 完全关闭
// - 使用设备指纹（主机名+CPU+MAC 的 SHA256）而非真实身份
// - 不收集代码内容、文件路径等敏感信息
// - 静默失败，不阻塞工作流

import crypto from 'node:crypto'
import os from 'node:os'

const BEACON_URL =
  process.env.MP_SKILLS_BEACON_URL || 'https://otheve.beacon.qq.com/analytics/v2_upload'

let cliVersion = 'unknown'
let deviceId = ''
let enabled = true

// ── 初始化 ──

function init() {
  enabled = process.env.MP_SKILLS_TELEMETRY_DISABLED !== 'true' &&
            process.env.DISABLE_TELEMETRY !== '1' &&
            process.env.DO_NOT_TRACK !== '1'

  if (!enabled) return

  // 生成设备指纹
  try {
    const info = [
      os.hostname(),
      os.cpus().map(c => c.model).join(','),
      Object.values(os.networkInterfaces())
        .flat()
        .filter((n: any) => n && !n.internal && n.mac)
        .map((n: any) => n.mac)
        .join(','),
    ].join('|')
    deviceId = crypto.createHash('sha256').update(info).digest('hex').slice(0, 32)
  } catch {
    deviceId = crypto.randomBytes(16).toString('hex')
  }
}

// ── 公共 API ──

export function setVersion(v: string) {
  cliVersion = v
  init()
}

export function isEnabled() {
  return enabled
}

/**
 * 上报事件
 */
export async function track(eventCode: string, eventData: Record<string, any> = {}) {
  if (!enabled) return

  try {
    const payload = {
      appVersion: cliVersion,
      sdkId: 'js',
      sdkVersion: '1.0.0',
      mainAppKey: process.env.MP_SKILLS_APP_KEY || 'MP_SKILLS_DEFAULT',
      platformId: 3,
      common: {
        A2: deviceId,
        from: 'mp-skills-cli',
        v: cliVersion,
      },
      events: [
        {
          eventCode,
          eventTime: String(Date.now()),
          mapValue: eventData,
        },
      ],
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    await fetch(BEACON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch(() => {})

    clearTimeout(timeout)
  } catch {
    // 静默失败
  }
}

/**
 * 快捷方法：工具调用跟踪
 */
export async function trackCommand(params: {
  command: string
  success?: boolean
  duration?: number
  error?: string
  detail?: string
}) {
  await track('mp_skills_command', {
    command: params.command,
    success: params.success !== false ? 'true' : 'false',
    duration: params.duration !== undefined ? String(params.duration) : undefined,
    error: params.error ? params.error.slice(0, 200) : undefined,
    detail: params.detail ? params.detail.slice(0, 200) : undefined,
    nodeVersion: process.version,
    osType: os.type(),
    osRelease: os.release(),
    arch: os.arch(),
    cliVersion,
  })
}
