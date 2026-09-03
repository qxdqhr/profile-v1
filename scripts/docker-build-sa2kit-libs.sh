#!/bin/sh
# Docker / CI：构建 submodule 库产物（dist 不进 git）。Alpine 无 bash。
# 根 package.json 用 pnpm.overrides 钉死单一 @types/react@19，避免 lucide DTS 双份类型冲突。
# common 发 d.ts；business 在 tsup 侧固定 dts:false。
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pnpm --filter @sa2kit-ui/shared build
pnpm --filter @sa2kit-ui/react build
SA2KIT_SKIP_DTS=0 SA2KIT_WITH_BUSINESS=1 SA2KIT_SKIP_PREPARE=1 \
  pnpm --filter sa2kit run build
