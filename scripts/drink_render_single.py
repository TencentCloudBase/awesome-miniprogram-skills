#!/usr/bin/env python3
"""Run a single drink-skill render and extract snapshot."""
import json, base64, subprocess, sys, os

api_name = sys.argv[1]
api_args = sys.argv[2]
out_dir = "cli-agent-run"

CLI = "/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
PROJECT = "/Users/bookerzhao/Projects/ai-mode-demo"
SKILL = "skills/drink-skill"

out_file = f"/tmp/rr_api_{api_name}.json"
png_file = f"{out_dir}/render-result.{api_name}.snapshot.png"

print(f"=== Rendering {api_name} ===")

# Run CLI
cmd = [
    CLI, "agent", "render",
    "--project", PROJECT,
    "--skill", SKILL,
    "--name", api_name,
    "--args", api_args,
    "--port", "0",
    "--timeout", "180000"
]

with open(out_file, "w") as f:
    result = subprocess.run(cmd, stdout=f, stderr=subprocess.STDOUT, timeout=300)

if result.returncode != 0:
    print(f"  CLI exit code: {result.returncode}")

# Parse output - find JSON in mixed output
with open(out_file) as f:
    content = f.read()

# Find JSON start
idx = content.find('{\\n  "command"')
if idx < 0:
    idx = content.find('{  "command"')
if idx < 0:
    # Try last {
    last_brace = content.rfind('{')
    if last_brace >= 0 and '"command"' in content[last_brace:last_brace+100]:
        idx = last_brace

if idx < 0:
    print(f"  FAIL: Could not find JSON in output")
    sys.exit(1)

data = json.loads(content[idx:])
snap = data.get('snapshotBase64', '')

if snap and snap.startswith('data:image/png;base64,'):
    b64 = snap[22:].strip()
    padding = (4 - len(b64) % 4) % 4
    if padding:
        b64 += '=' * padding
    raw = base64.b64decode(b64)
    with open(png_file, 'wb') as f:
        f.write(raw)
    print(f"  OK - {len(raw)} bytes -> {png_file}")
else:
    status = data.get('status', 'N/A')
    print(f"  FAIL - status={status}, has_snapshot={bool(snap)}")
    sys.exit(1)
