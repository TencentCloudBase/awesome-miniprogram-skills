#!/usr/bin/env bash
# ── mp-skills 本地体验脚本 ──
# 用法: bash cli/demo.sh

set -e

CLI_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP_DIR="/tmp/mp-skills-demo-$(date +%s)"
SKILLS_REPO="TencentCloudBase/awesome-miniprogram-skills"

echo "============================================"
echo "  mp-skills CLI 本地体验"
echo "============================================"
echo ""

# ── 1. 创建测试项目 ──
echo "────────────────────────────────────────"
echo " [1/5] 创建一个测试小程序项目"
echo "────────────────────────────────────────"
mkdir -p "$TMP_DIR/test-app/miniprogram/pages/index"
mkdir -p "$TMP_DIR/test-app/cloudfunctions"
echo '{"pages":["pages/index/index"]}' > "$TMP_DIR/test-app/miniprogram/app.json"
echo '{}' > "$TMP_DIR/test-app/miniprogram/app.js"
echo '{"appid":"wx_demo"}' > "$TMP_DIR/test-app/project.config.json"
echo "  ✓ 项目创建完成: $TMP_DIR/test-app"
echo ""

# ── 2. 编译 CLI ──
echo "────────────────────────────────────────"
echo " [2/5] 编译 CLI"
echo "────────────────────────────────────────"
cd "$CLI_DIR"
npm run build > /dev/null 2>&1
echo "  ✓ 编译完成"
echo ""

# ── 3. 列出远程可用 Skill ──
echo "────────────────────────────────────────"
echo " [3/5] 列出远程可用 Skill"
echo "────────────────────────────────────────"
cd "$TMP_DIR/test-app"
node "$CLI_DIR/bin/mp-skills.mjs" list --remote
echo ""

# ── 4. 安装一个 Skill ──
echo "────────────────────────────────────────"
echo " [4/5] 安装 drink-skill"
echo "────────────────────────────────────────"
cd "$TMP_DIR/test-app"
node "$CLI_DIR/bin/mp-skills.mjs" add awesome-miniprogram --skill drink-skill -y
echo ""

# ── 5. 验证结果 ──
echo "────────────────────────────────────────"
echo " [5/5] 验证安装结果"
echo "────────────────────────────────────────"
cd "$TMP_DIR/test-app"

echo "--- skills/ 目录 ---"
ls -la skills/ 2>/dev/null

echo ""
echo "--- app.json agent.skills ---"
node -e "const a=JSON.parse(require('fs').readFileSync('miniprogram/app.json','utf-8')); console.log(JSON.stringify(a.agent,null,2))"

echo ""
echo "--- 锁文件 ---"
cat skills-lock.json 2>/dev/null | head -20

echo ""
echo "============================================"
echo "  ✅ 体验完成！"
echo "============================================"
echo ""
echo "本地 CLI 命令:"
echo "  node $CLI_DIR/bin/mp-skills.mjs --help"
echo ""
echo "体验项目: $TMP_DIR/test-app"
echo "  cd $TMP_DIR/test-app"
echo "  node $CLI_DIR/bin/mp-skills.mjs list --all"
