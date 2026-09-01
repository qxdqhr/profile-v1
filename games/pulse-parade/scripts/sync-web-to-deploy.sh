#!/usr/bin/env bash
# 本地：导出 Web 到 deploy/games/pulse-parade/www/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
DEST="$REPO/deploy/games/pulse-parade/www"
mkdir -p "$ROOT/export/web" "$DEST"
godot --headless --path "$ROOT" --export-release "Web" "$ROOT/export/web/index.html"
rsync -a --delete --exclude '.gitkeep' "$ROOT/export/web/" "$DEST/"
echo "Synced to $DEST"
ls -lh "$DEST"
