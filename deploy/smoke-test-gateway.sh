#!/usr/bin/env bash
# 网关栈冒烟测试：CI / 部署脚本调用，失败时 exit 1
set -euo pipefail

GATEWAY_PORT="${GATEWAY_PORT:-3000}"
BASE="http://127.0.0.1:${GATEWAY_PORT}"

fail=0

check_http() {
  local name="$1"
  local url="$2"
  local expect="$3"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo ERR)"
  echo "${name} => ${code} (期望 ${expect})"
  if [ "$code" != "$expect" ]; then
    fail=1
  fi
}

echo "=== 网关冒烟测试 (${BASE}) ==="
check_http "GET /" "${BASE}/" "200"
check_http "GET /api/auth/get-session" "${BASE}/api/auth/get-session" "200"
check_http "GET /calendar/" "${BASE}/calendar/" "200"
check_http "GET /teach-hub/" "${BASE}/teach-hub/" "200"
# 未登录应 401；404 表示 nginx basePath 反代未对齐
check_http "GET /api/calendar/events/" \
  "${BASE}/api/calendar/events/?startDate=2026-01-01&endDate=2026-12-31" "401"
check_http "GET /api/teach-hub/workspaces/" "${BASE}/api/teach-hub/workspaces/" "401"

if [ "$fail" -ne 0 ]; then
  echo "ERROR: 网关冒烟测试失败。请检查 nginx/profile-platform.conf 是否已同步并重载。" >&2
  exit 1
fi

echo "OK: 网关冒烟测试通过"
