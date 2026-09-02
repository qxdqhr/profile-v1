#!/usr/bin/env bash
# 导出 app_games/ 下全部（或 GODOT_SLUGS 列表）Godot 游戏的 Web 包
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [[ -n "${GODOT_SLUGS:-}" ]]; then
  # shellcheck disable=SC2206
  SLUGS=(${GODOT_SLUGS})
else
  SLUGS=()
  for proj in app_games/*/project.godot; do
    [[ -f "$proj" ]] || continue
    SLUGS+=("$(basename "$(dirname "$proj")")")
  done
fi

if [[ ${#SLUGS[@]} -eq 0 ]]; then
  echo "No Godot games found under app_games/" >&2
  exit 1
fi

echo "Exporting slugs: ${SLUGS[*]}"
for slug in "${SLUGS[@]}"; do
  bash "${REPO_ROOT}/scripts/export-godot-game.sh" "$slug"
done
