#!/usr/bin/env bash
# 为 Godot www 预生成 .gz，供 nginx gzip_static 直出（避免现场压缩 38MB wasm）。
# 用法: compress-godot-www.sh <www-dir>
set -euo pipefail
DIR="${1:-}"
if [[ -z "$DIR" || ! -d "$DIR" ]]; then
  echo "Usage: $0 <www-dir>" >&2
  exit 1
fi

pretty() {
  local n="$1"
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec "$n"
  else
    echo "${n}B"
  fi
}

count=0
for f in "$DIR"/index.wasm "$DIR"/index.pck "$DIR"/index.js \
         "$DIR"/index.audio.worklet.js "$DIR"/index.audio.position.worklet.js; do
  [[ -f "$f" ]] || continue
  gzip -9 -kf "$f"
  # gzip_static 要求 .gz 的 mtime ≥ 原文件；gzip -k 常把 mtime 拷成相同，再 touch 一次更稳妥
  touch "$f.gz"
  orig=$(stat -c%s "$f")
  gz=$(stat -c%s "$f.gz")
  echo "gzip $(basename "$f"): $(pretty "$orig") → $(pretty "$gz")"
  count=$((count + 1))
done
if [[ "$count" -eq 0 ]]; then
  echo "WARN: no Godot binaries to gzip in $DIR" >&2
fi
