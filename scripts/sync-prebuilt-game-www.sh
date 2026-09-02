#!/usr/bin/env bash
# 把 .use-prebuilt-web 游戏的仓内预构建包同步到 deploy/games/<slug>/www/
# 供 CI 部署在未跑 Godot 导出时也能带上 diner-dash 等 Spine 包。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
shopt -s nullglob
synced=0
for marker in "${REPO_ROOT}"/app_games/*/.use-prebuilt-web; do
  slug="$(basename "$(dirname "$marker")")"
  game_dir="${REPO_ROOT}/app_games/${slug}"
  src=""
  for candidate in prebuilt-web web; do
    if [[ -f "${game_dir}/${candidate}/index.html" ]]; then
      src="${game_dir}/${candidate}"
      break
    fi
  done
  if [[ -z "$src" ]]; then
    echo "WARN: ${slug} has .use-prebuilt-web but no prebuilt-web/index.html" >&2
    continue
  fi
  out="${REPO_ROOT}/deploy/games/${slug}/www"
  mkdir -p "$out"
  rsync -a --delete --exclude '.gitkeep' "${src}/" "${out}/"
  echo "synced prebuilt ${slug} ← ${src}"
  synced=$((synced + 1))
done

if [[ "$synced" -eq 0 ]]; then
  echo "No .use-prebuilt-web packages to sync"
fi
