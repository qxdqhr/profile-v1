#!/bin/sh
# Docker / CI：构建 submodule 库产物（dist 不进 git）。Alpine 无 bash。
# 根 package.json 已用 pnpm.overrides 钉死 @types/react@18，sa2kit 可正常发 d.ts。
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pnpm --filter @sa2kit-ui/shared build
pnpm --filter @sa2kit-ui/react build
SA2KIT_SKIP_DTS=0 SA2KIT_WITH_BUSINESS=1 SA2KIT_SKIP_PREPARE=1 \
  pnpm --filter sa2kit run build
