#!/usr/bin/env bash
# 若 /games/godot-engine/ 缺少共享 wasm/js，从仍带完整引擎的标准 Godot 包复制一份。
# 用于：CI 未改 app_games（GAMES_CHANGED=false）但服务器从未落盘共享引擎的场景。
# diner-dash 等 GDExtension 包不参与。
set -euo pipefail

# shellcheck source=./_lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"
cd "$DEPLOY_DIR"

ENGINE_DIR="games/godot-engine/www"
ENGINE_SLUG="godot-engine"

if [ -f "${ENGINE_DIR}/index.wasm" ] && [ -f "${ENGINE_DIR}/index.js" ]; then
  echo "OK: shared godot-engine already present (${ENGINE_DIR})"
  exit 0
fi

echo "WARN: ${ENGINE_DIR} 缺少 index.wasm/js，尝试从本机 games/*/www 引导…"

is_shareable_donor() {
  local www="$1"
  local html="${www}/index.html"
  [ -f "$html" ] && [ -f "${www}/index.wasm" ] && [ -f "${www}/index.js" ] || return 1
  # 非空 gdextensionLibs（Spine 等）不能与官方模板共用
  if grep -Eq '"gdextensionLibs":\[[^]]' "$html" 2>/dev/null; then
    return 1
  fi
  return 0
}

DONOR=""
for www in games/*/www; do
  [ -d "$www" ] || continue
  slug="$(basename "$(dirname "$www")")"
  [ "$slug" = "$ENGINE_SLUG" ] && continue
  if is_shareable_donor "$www"; then
    DONOR="$www"
    break
  fi
done

if [ -z "$DONOR" ]; then
  echo "ERROR: 无法引导共享引擎——本机无带 index.wasm+js 的标准 Godot 包。" >&2
  echo "  请触发 CI games 导出（改 app_games 或 deploy/scripts/godot/*）以同步 godot-engine。" >&2
  exit 1
fi

mkdir -p "$ENGINE_DIR"
for f in index.js index.wasm \
         index.audio.worklet.js index.audio.position.worklet.js \
         index.worker.js; do
  if [ -f "${DONOR}/${f}" ]; then
    cp -f "${DONOR}/${f}" "${ENGINE_DIR}/${f}"
  fi
done
for f in index.js.gz index.wasm.gz \
         index.audio.worklet.js.gz index.audio.position.worklet.js.gz \
         index.worker.js.gz; do
  if [ -f "${DONOR}/${f}" ]; then
    cp -f "${DONOR}/${f}" "${ENGINE_DIR}/${f}"
  fi
done

# gzip_static：有原文件无 .gz 时补压；已有则 touch 满足 mtime
if [ -f "$DEPLOY_DIR/compress-godot-www.sh" ]; then
  bash "$DEPLOY_DIR/compress-godot-www.sh" "$ENGINE_DIR" || true
fi
touch "${ENGINE_DIR}"/index.wasm.gz "${ENGINE_DIR}"/index.js.gz 2>/dev/null || true

if [ ! -f "${ENGINE_DIR}/index.wasm" ] || [ ! -f "${ENGINE_DIR}/index.js" ]; then
  echo "ERROR: 引导后仍缺少 ${ENGINE_DIR}/index.wasm 或 index.js" >&2
  exit 1
fi

echo "OK: bootstrapped shared engine from ${DONOR} → ${ENGINE_DIR}"
ls -lh "${ENGINE_DIR}/index.js" "${ENGINE_DIR}/index.wasm"
