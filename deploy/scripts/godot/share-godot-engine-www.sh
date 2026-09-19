#!/usr/bin/env bash
# 将同变体 Godot Web 引擎（wasm/js/worklet）抽到 /games/godot-engine/，
# 各游戏 www 只保留 index.html + index.pck（及图标），HTML 指向共享引擎。
# diner-dash 等带 GDExtension 的包不参与共用。
#
# 用法: share-godot-engine-www.sh
# 依赖: deploy/games/*/www 已由 export-godot-game.sh 写出
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
GAMES_ROOT="${REPO_ROOT}/deploy/games"
ENGINE_SLUG="${GODOT_SHARED_ENGINE_SLUG:-godot-engine}"
ENGINE_URL_BASE="/games/${ENGINE_SLUG}"
ENGINE_DIR="${GAMES_ROOT}/${ENGINE_SLUG}/www"
ENGINE_EXE="${ENGINE_URL_BASE}/index"

sha_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

is_shareable_www() {
  local www="$1"
  local html="${www}/index.html"
  [[ -f "$html" && -f "${www}/index.wasm" && -f "${www}/index.pck" && -f "${www}/index.js" ]] || return 1
  # 非空 gdextensionLibs（Spine 等）不能与官方模板共用
  if grep -Eq '"gdextensionLibs":\[[^]]' "$html"; then
    return 1
  fi
  return 0
}

CANDIDATES=()
for www in "${GAMES_ROOT}"/*/www; do
  [[ -d "$www" ]] || continue
  slug="$(basename "$(dirname "$www")")"
  [[ "$slug" == "$ENGINE_SLUG" ]] && continue
  if is_shareable_www "$www"; then
    CANDIDATES+=("$www")
  else
    echo "SKIP share (prebuilt/GDExtension/incomplete): ${slug}" >&2
  fi
done

if [[ ${#CANDIDATES[@]} -eq 0 ]]; then
  echo "WARN: no shareable Godot www dirs; skip shared engine" >&2
  exit 0
fi

REF="${CANDIDATES[0]}"
REF_HASH="$(sha_file "${REF}/index.wasm")"
echo "Shared engine reference: ${REF} (wasm sha256=${REF_HASH})"

for www in "${CANDIDATES[@]}"; do
  h="$(sha_file "${www}/index.wasm")"
  if [[ "$h" != "$REF_HASH" ]]; then
    echo "ERROR: index.wasm mismatch between games; cannot share engine:" >&2
    echo "  ref  ${REF} ${REF_HASH}" >&2
    echo "  bad  ${www} ${h}" >&2
    echo "  Ensure all shareable games use Godot ${GODOT_VERSION:-4.7.x} web_nothreads + same export variant." >&2
    exit 1
  fi
done

mkdir -p "$ENGINE_DIR"
# 引擎侧文件（不含 pck / 每游戏 splash）
for f in index.js index.wasm \
         index.audio.worklet.js index.audio.position.worklet.js; do
  if [[ -f "${REF}/${f}" ]]; then
    cp -f "${REF}/${f}" "${ENGINE_DIR}/${f}"
  fi
done
# 可选：worker（threads 变体才有；nothreads 通常没有）
if [[ -f "${REF}/index.worker.js" ]]; then
  cp -f "${REF}/index.worker.js" "${ENGINE_DIR}/index.worker.js"
fi

bash "${REPO_ROOT}/deploy/scripts/godot/compress-godot-www.sh" "$ENGINE_DIR"

WASM_SIZE="$(wc -c < "${ENGINE_DIR}/index.wasm" | tr -d ' ')"

rewrite_html() {
  local html="$1"
  local pck_size="$2"
  python3 - "$html" "$ENGINE_EXE" "$ENGINE_URL_BASE" "$WASM_SIZE" "$pck_size" <<'PY'
import json, re, sys
from pathlib import Path

html_path, engine_exe, engine_url_base, wasm_size, pck_size = sys.argv[1:6]
wasm_size, pck_size = int(wasm_size), int(pck_size)
text = Path(html_path).read_text(encoding="utf-8")

# script src → 共享 index.js
text2, n = re.subn(
    r'(<script\s+src=")index\.js(">)',
    rf'\1{engine_url_base}/index.js\2',
    text,
    count=1,
)
if n != 1:
    # 已改写过则允许幂等
    if f'src="{engine_url_base}/index.js"' not in text:
        raise SystemExit(f"ERROR: could not rewrite index.js script src in {html_path}")
    text2 = text

m = re.search(r"const GODOT_CONFIG\s*=\s*(\{.*?\});", text2, re.S)
if not m:
    raise SystemExit(f"ERROR: GODOT_CONFIG not found in {html_path}")
cfg = json.loads(m.group(1))
cfg["executable"] = engine_exe
cfg["mainPack"] = "index.pck"
sizes = dict(cfg.get("fileSizes") or {})
# 去掉旧相对路径 wasm 键，写入共享绝对路径
for k in list(sizes):
    if k.endswith(".wasm"):
        del sizes[k]
sizes["index.pck"] = pck_size
sizes[f"{engine_exe}.wasm"] = wasm_size
cfg["fileSizes"] = sizes
# 空 libs 可保留；非空不应进入本脚本
new_cfg = json.dumps(cfg, separators=(",", ":"), ensure_ascii=False)
text3 = text2[: m.start(1)] + new_cfg + text2[m.end(1) :]
Path(html_path).write_text(text3, encoding="utf-8")
print(f"rewrote {html_path}")
PY
}

for www in "${CANDIDATES[@]}"; do
  slug="$(basename "$(dirname "$www")")"
  pck_size="$(wc -c < "${www}/index.pck" | tr -d ' ')"
  rewrite_html "${www}/index.html" "$pck_size"
  # 删除每游戏重复引擎文件（保留 pck / html / 图标 / splash）
  rm -f "${www}/index.js" "${www}/index.js.gz" \
        "${www}/index.wasm" "${www}/index.wasm.gz" \
        "${www}/index.audio.worklet.js" "${www}/index.audio.worklet.js.gz" \
        "${www}/index.audio.position.worklet.js" "${www}/index.audio.position.worklet.js.gz" \
        "${www}/index.worker.js" "${www}/index.worker.js.gz"
  # 仍压缩本游戏 pck（及可能残留的小文件）
  if [[ -f "${www}/index.pck" ]]; then
    gzip -9 -kf "${www}/index.pck"
    touch "${www}/index.pck.gz"
  fi
  echo "OK shared-engine slug=${slug}"
done

echo "OK: shared engine at ${ENGINE_DIR} → ${ENGINE_URL_BASE}/"
ls -lh "$ENGINE_DIR"
