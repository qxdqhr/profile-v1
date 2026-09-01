#!/usr/bin/env bash
# 兼容旧入口
exec "$(cd "$(dirname "$0")" && pwd)/export-godot-game.sh" pulse-parade
