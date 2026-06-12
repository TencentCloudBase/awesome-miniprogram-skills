#!/bin/bash
# setup-cloudfunctions.sh
# 将 skills/*/cloudfunctions/ 下的云函数聚合到项目根目录 cloudfunctions/
# 用法: bash scripts/setup-cloudfunctions.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/skills"
CF_DIR="$PROJECT_ROOT/cloudfunctions"

echo "🔧 聚合云函数..."
echo "   源: $SKILLS_DIR/*/cloudfunctions/"
echo "   目标: $CF_DIR"
echo ""

# 收集云函数目录
FUNC_DIRS=()
while IFS= read -r -d '' func_dir; do
  func_name=$(basename "$func_dir")
  if [ -f "$func_dir/index.js" ] && [ -f "$func_dir/package.json" ]; then
    FUNC_DIRS+=("$func_dir")
    echo "   ✅ 发现: $func_name ($func_dir)"
  else
    echo "   ⚠️  跳过不完整: $func_name"
  fi
done < <(find "$SKILLS_DIR" -type d -name "cloudfunctions" -exec find {} -mindepth 1 -maxdepth 1 -type d \; -print0)

COUNT=${#FUNC_DIRS[@]}
echo ""
echo "📋 共发现 $COUNT 个云函数"
echo ""

if [ "$COUNT" -eq 0 ]; then
  echo "❌ 没有发现有效的云函数"
  exit 1
fi

mkdir -p "$CF_DIR"

for func_dir in "${FUNC_DIRS[@]}"; do
  func_name=$(basename "$func_dir")
  dest="$CF_DIR/$func_name"
  if [ -d "$dest" ]; then
    echo "   ⚠️  $func_name 已存在，跳过"
  else
    cp -r "$func_dir" "$dest"
    echo "   ✅ $func_name"
  fi
done

echo ""
echo "🎉 完成！"
echo ""
echo "📂 云函数列表:"
ls -1 "$CF_DIR"
echo ""
echo "💡 下一步: 使用 CloudBase CLI 或 MCP 工具逐个部署云函数"
