#!/usr/bin/env bash
# CI / 打包用：只初始化公开且部署需要的 submodule，避免 recursive 拉私有仓失败。
# 私有挂载（app_mobile/profile-rn、shared-file）在 .gitmodules 中为 update=none。
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

# 全部 app_games/* 子模块（含 prebuilt）
while IFS= read -r line; do
  [[ "$line" == app_games/* ]] || continue
  paths+=("$line")
done < <(git config -f .gitmodules --get-regexp '^submodule\..*\.path$' | awk '{print $2}')

mapfile -t paths < <(printf '%s\n' "${paths[@]}" | awk 'NF && !seen[$0]++')

echo "[ci] init packaging submodules (${#paths[@]} paths)…"
git submodule update --init --recursive -- "${paths[@]}"
echo "[ci] packaging submodules ready"
