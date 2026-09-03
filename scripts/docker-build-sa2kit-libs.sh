#!/usr/bin/env bash
# Docker / CI：在 pnpm install 之后构建 submodule 库产物（dist 不进 git）。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pnpm --filter @sa2kit-ui/shared build
pnpm --filter @sa2kit-ui/react build
SA2KIT_WITH_BUSINESS=1 pnpm --filter sa2kit run build
