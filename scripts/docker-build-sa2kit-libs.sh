#!/usr/bin/env bash
# Docker / CI：在 pnpm install 之后构建 submodule 库产物（dist 不进 git）。
# SA2KIT_SKIP_DTS=1：宿主 monorepo 内 React 19 @types 会让 sa2kit DTS 失败，镜像只需 JS 产物。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pnpm --filter @sa2kit-ui/shared build
pnpm --filter @sa2kit-ui/react build
SA2KIT_SKIP_DTS=1 SA2KIT_WITH_BUSINESS=1 pnpm --filter sa2kit run build
