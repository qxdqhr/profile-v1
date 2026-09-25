#!/usr/bin/env bash
# 等待网关栈就绪（容器重启后 nginx 可能短暂 502）
set -euo pipefail

# shellcheck source=./_lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"
cd "$DEPLOY_DIR"

GATEWAY_PORT="${GATEWAY_PORT:-3000}"
BASE="http://127.0.0.1:${GATEWAY_PORT}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
SLEEP_SECS="${SLEEP_SECS:-2}"
MODULES_JSON="${MODULES_JSON:-$DEPLOY_DIR/runtime-modules.json}"

if [ -z "${RUNTIME_ENABLED_CSV:-}" ] && [ -f "$GATEWAY_DIR/resolve-runtime-modules.py" ] && [ -f "$MODULES_JSON" ]; then
  # shellcheck disable=SC1091
  eval "$(python3 "$GATEWAY_DIR/resolve-runtime-modules.py" "$MODULES_JSON")"
fi

ENABLED_CSV="${RUNTIME_ENABLED_CSV:-web,calendar}"

module_on() {
  case ",${ENABLED_CSV}," in
    *",$1,"*) return 0 ;;
    *) return 1 ;;
  esac
}

echo "=== 等待网关就绪 (${BASE})，最多 ${MAX_ATTEMPTS} 次 ==="

for i in $(seq 1 "$MAX_ATTEMPTS"); do
  root_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/" 2>/dev/null || echo ERR)"
  code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/api/auth/get-session" 2>/dev/null || echo ERR)"
  probe_ok=0
  if [ "$root_code" = "200" ]; then
    if module_on calendar; then
      cal_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/calendar/" 2>/dev/null || echo ERR)"
      echo "尝试 ${i}/${MAX_ATTEMPTS}: /=${root_code} auth=${code} calendar=${cal_code}"
      [ "$cal_code" = "200" ] && probe_ok=1
    else
      echo "尝试 ${i}/${MAX_ATTEMPTS}: /=${root_code} auth=${code} (calendar disabled)"
      probe_ok=1
    fi
  else
    echo "尝试 ${i}/${MAX_ATTEMPTS}: /=${root_code} auth=${code}"
  fi

  # 网关就绪以页面可达为准；auth 应用层 500 不应阻断部署拉起
  if [ "$probe_ok" = "1" ]; then
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
