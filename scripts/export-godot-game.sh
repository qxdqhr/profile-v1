#!/usr/bin/env bash
# CI / 本地：安装 Godot 4.7.1 + templates，导出指定 slug 的 Web 包
# 用法: export-godot-game.sh <slug>
# 例:   export-godot-game.sh pulse-parade
#       export-godot-game.sh flappy-wish
set -euo pipefail

SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: $0 <slug>" >&2
  exit 1
fi

GODOT_VERSION="${GODOT_VERSION:-4.7.1}"
GODOT_TAG="${GODOT_TAG:-4.7.1-stable}"
CACHE_DIR="${GODOT_CACHE_DIR:-$HOME/.cache/godot-ci}"
TEMPLATES_DIR="${HOME}/.local/share/godot/export_templates/${GODOT_VERSION}.stable"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GAME_DIR="${REPO_ROOT}/games/${SLUG}"
OUT_DIR="${REPO_ROOT}/deploy/games/${SLUG}/www"
EDITOR_ZIP="${CACHE_DIR}/Godot_v${GODOT_TAG}_linux.x86_64.zip"
TEMPLATES_TPZ="${CACHE_DIR}/Godot_v${GODOT_TAG}_export_templates.tpz"
EDITOR_BIN="${CACHE_DIR}/Godot_v${GODOT_TAG}_linux.x86_64"
BASE_URL="${GODOT_DOWNLOAD_BASE:-https://github.com/godotengine/godot/releases/download/${GODOT_TAG}}"

if [[ ! -f "${GAME_DIR}/project.godot" ]]; then
  echo "ERROR: missing ${GAME_DIR}/project.godot" >&2
  exit 1
fi

mkdir -p "$CACHE_DIR" "$OUT_DIR" "$(dirname "$TEMPLATES_DIR")"

download() {
  local url="$1" dest="$2"
  if [[ -f "$dest" && -s "$dest" ]]; then
    echo "Using cached $(basename "$dest")"
    return 0
  fi
  echo "Downloading $url"
  curl -L --fail --retry 5 --retry-delay 2 -o "${dest}.partial" "$url"
  mv "${dest}.partial" "$dest"
}

download "${BASE_URL}/Godot_v${GODOT_TAG}_linux.x86_64.zip" "$EDITOR_ZIP"
download "${BASE_URL}/Godot_v${GODOT_TAG}_export_templates.tpz" "$TEMPLATES_TPZ"

if [[ ! -x "$EDITOR_BIN" ]]; then
  unzip -o -q "$EDITOR_ZIP" -d "$CACHE_DIR"
  chmod +x "$EDITOR_BIN"
fi

if [[ ! -f "${TEMPLATES_DIR}/web_nothreads_release.zip" ]]; then
  echo "Installing export templates to $TEMPLATES_DIR"
  TMP="$(mktemp -d)"
  unzip -q "$TEMPLATES_TPZ" -d "$TMP"
  if [[ -d "$TMP/templates" ]]; then
    mkdir -p "$TEMPLATES_DIR"
    rsync -a --delete "$TMP/templates/" "$TEMPLATES_DIR/"
  else
    mkdir -p "$TEMPLATES_DIR"
    rsync -a --delete "$TMP/" "$TEMPLATES_DIR/"
  fi
  rm -rf "$TMP"
fi

test -f "${TEMPLATES_DIR}/version.txt"
echo "Templates: $(cat "${TEMPLATES_DIR}/version.txt")"
echo "Exporting slug=${SLUG}"

"$EDITOR_BIN" --headless --path "$GAME_DIR" --import --quit
mkdir -p "${GAME_DIR}/export/web"
"$EDITOR_BIN" --headless --path "$GAME_DIR" --export-release "Web" "${GAME_DIR}/export/web/index.html"
rsync -a --delete --exclude '.gitkeep' "${GAME_DIR}/export/web/" "${OUT_DIR}/"
test -f "${OUT_DIR}/index.html"
test -f "${OUT_DIR}/index.wasm"
test -f "${OUT_DIR}/index.pck"
ls -lh "${OUT_DIR}"
echo "OK: ${SLUG} → ${OUT_DIR}"
