#!/usr/bin/env bash
# 将最近可用的 qhr-profile-<app> 镜像晋升为指定 tag（CI 统一 IMAGE_TAG 用）。
# 用法: REGISTRY=... bash deploy/scripts/ci/ci-promote-docker-image.sh <app> <new_tag>
set -euo pipefail

APP="${1:?usage: ci-promote-docker-image.sh <app> <new_tag>}"
NEW="${2:?usage: ci-promote-docker-image.sh <app> <new_tag>}"
REGISTRY="${REGISTRY:?REGISTRY is required}"
LOOKBACK="${LOOKBACK:-50}"

DST="${REGISTRY}/qhr-profile-${APP}:${NEW}"
FOUND=""

for try in $(seq 1 "${LOOKBACK}"); do
  CAND=$(( NEW - try ))
  if [ "$CAND" -lt 1 ]; then
    break
  fi
  SRC="${REGISTRY}/qhr-profile-${APP}:${CAND}"
  if docker pull "$SRC"; then
    FOUND="$CAND"
    break
  fi
  echo "tag ${CAND} 不存在，继续回溯…"
done

if [ -z "$FOUND" ]; then
  echo "ERROR: 在近 ${LOOKBACK} 个 run 内找不到 ${APP} 可用镜像，无法晋升到 ${NEW}。" >&2
  echo "若 ${APP} 为新增子应用，请先触发一次成功构建。" >&2
  exit 1
fi

docker tag "${REGISTRY}/qhr-profile-${APP}:${FOUND}" "$DST"
docker push "$DST"
echo "Promoted ${APP}: ${FOUND} -> ${NEW}"

if [ "$APP" = "web" ]; then
  LEGACY_SRC="${REGISTRY}/qhr-profile:${FOUND}"
  LEGACY_DST="${REGISTRY}/qhr-profile:${NEW}"
  if docker pull "$LEGACY_SRC" 2>/dev/null; then
    docker tag "$LEGACY_SRC" "$LEGACY_DST"
    docker push "$LEGACY_DST"
  else
    docker tag "$DST" "$LEGACY_DST"
    docker push "$LEGACY_DST"
  fi
fi
