#!/usr/bin/env bash
# 等待网关栈就绪（容器重启后 nginx 可能短暂 502）
set -euo pipefail

GATEWAY_PORT="${GATEWAY_PORT:-3000}"
BASE="http://127.0.0.1:${GATEWAY_PORT}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
SLEEP_SECS="${SLEEP_SECS:-2}"

echo "=== 等待网关就绪 (${BASE})，最多 ${MAX_ATTEMPTS} 次 ==="

for i in $(seq 1 "$MAX_ATTEMPTS"); do
  root_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/" 2>/dev/null || echo ERR)"
  code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/api/auth/get-session" 2>/dev/null || echo ERR)"
  cal_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/calendar/" 2>/dev/null || echo ERR)"
  echo "尝试 ${i}/${MAX_ATTEMPTS}: /=${root_code} auth=${code} calendar=${cal_code}"

  # 网关就绪以页面可达为准；auth 应用层 500 不应阻断部署拉起
  if [ "$root_code" = "200" ] && [ "$cal_code" = "200" ]; then
    if [ "$code" != "200" ]; then
      echo "WARN: 网关页面已就绪，但 auth=${code}（应用层问题，不阻断部署）"
    else
      echo "OK: 网关已就绪"
    fi
    exit 0
  fi

  sleep "$SLEEP_SECS"
done

echo "ERROR: 网关未在时限内就绪" >&2
exit 1
