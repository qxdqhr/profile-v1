#!/usr/bin/env bash
# 把 sa2kit-godot CJK 插件挂进某个 app_games/<slug>（本地 clone，.gitmodules 指向 GitHub）。
# 用法: apply-sa2kit-godot-cjk.sh <slug>
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"
if [[ -z "$SLUG" ]]; then
  echo "Usage: $0 <slug>" >&2
  exit 1
fi
GAME_DIR="${REPO_ROOT}/app_games/${SLUG}"
ADDON_SRC="${HOME}/project/sa2kit-godot"
if [[ ! -f "${GAME_DIR}/project.godot" ]]; then
  echo "ERROR: missing ${GAME_DIR}/project.godot" >&2
  exit 1
fi
if [[ ! -f "${ADDON_SRC}/plugin.cfg" ]]; then
  echo "ERROR: missing ${ADDON_SRC} (clone qxdqhr/sa2kit-godot next to profile-v1)" >&2
  exit 1
fi

mkdir -p "${GAME_DIR}/addons"
if [[ ! -f "${GAME_DIR}/addons/sa2kit_godot/plugin.cfg" ]]; then
  rm -rf "${GAME_DIR}/addons/sa2kit_godot"
  git clone "${ADDON_SRC}" "${GAME_DIR}/addons/sa2kit_godot"
  git -C "${GAME_DIR}/addons/sa2kit_godot" remote set-url origin https://github.com/qxdqhr/sa2kit-godot.git
fi

python3 - "$GAME_DIR" << 'PY'
from pathlib import Path
import sys
game = Path(sys.argv[1])
gm = game / ".gitmodules"
block = """[submodule "addons/sa2kit_godot"]
	path = addons/sa2kit_godot
	url = https://github.com/qxdqhr/sa2kit-godot.git
"""
if gm.exists():
    text = gm.read_text()
    if "addons/sa2kit_godot" not in text:
        gm.write_text(text.rstrip() + "\n" + block)
else:
    gm.write_text(block)

p = game / "project.godot"
text = p.read_text()
auto = 'Sa2kitCjk="*res://addons/sa2kit_godot/autoload/cjk_boot.gd"'
if "Sa2kitCjk=" not in text:
    if "[autoload]\n" in text:
        text = text.replace("[autoload]\n", "[autoload]\n\n" + auto + "\n", 1)
    else:
        text += "\n[autoload]\n\n" + auto + "\n"
if "theme/custom_font=" not in text:
    text += '\n[gui]\n\ntheme/custom_font="res://addons/sa2kit_godot/fonts/SourceHanSansCN-Regular.otf"\n'
if "sa2kit_godot/plugin.cfg" not in text:
    if "[editor_plugins]" in text:
        print("WARN: editor_plugins exists; add plugin.cfg by hand", file=sys.stderr)
    else:
        text += '\n[editor_plugins]\n\nenabled=PackedStringArray("res://addons/sa2kit_godot/plugin.cfg")\n'
p.write_text(text)
print("patched", p)
PY
