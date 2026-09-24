#!/usr/bin/env bash
# CI / 打包用：只初始化公开且部署需要的 submodule，避免拉私有仓失败。
# 切勿把 .gitmodules 全表塞进 update 参数——显式 path 会无视 update=none。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

paths=(
  packages/sa2kit
  packages/sa2kit-ui
  packages/sa2kit-skill
  app_wordpress/holt
  app_mobile/calendar-mobile
  app_mobile/teach-hub-mobile
  app_desktop/teach-hub-desktop
  app_desktop/lan-drop
)

# 仅 app_games/*（公开游戏旁路）
while IFS= read -r line; do
  case "$line" in
    app_games/*) paths+=("$line") ;;
  esac
done < <(git config -f .gitmodules --get-regexp '^submodule\..*\.path$' | awk '{print $2}')

mapfile -t paths < <(printf '%s\n' "${paths[@]}" | awk 'NF && !seen[$0]++')

# 只保留仓库里真实存在 gitlink 的路径
existing=()
for p in "${paths[@]}"; do
  if git ls-files --error-unmatch "$p" >/dev/null 2>&1; then
    existing+=("$p")
  else
    echo "[ci] skip missing path: $p"
  fi
done

echo "[ci] init packaging submodules (${#existing[@]} paths)…"
printf '  - %s\n' "${existing[@]}"
git submodule update --init --recursive -- "${existing[@]}"
echo "[ci] packaging submodules ready"
