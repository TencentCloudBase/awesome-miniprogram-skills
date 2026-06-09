// ── 工具函数 ──

export function log(msg: string): void { console.log(msg) }

export function warn(msg: string): void { console.log(`  ⚠️  ${msg}`) }

export function ok(msg: string): void { console.log(`  ✓ ${msg}`) }

export function title(msg: string): void { console.log(`\n${msg}`) }
