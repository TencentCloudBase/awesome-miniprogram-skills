// @cloudbase/mp-skills — CLI launcher
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// Use dynamic import for the CLI module
await import('../src/cli.mjs')
