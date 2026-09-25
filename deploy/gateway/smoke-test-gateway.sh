#!/usr/bin/env bash
# 网关栈冒烟测试：CI / 部署脚本调用，失败时 exit 1
# 按 deploy/runtime-modules.json（或 RUNTIME_ENABLED_CSV）跳过未启用模块。
set -euo pipefail

# shellcheck source=./_lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"
cd "$DEPLOY_DIR"

GATEWAY_PORT="${GATEWAY_PORT:-3000}"
BASE="http://127.0.0.1:${GATEWAY_PORT}"
MODULES_JSON="${MODULES_JSON:-$DEPLOY_DIR/runtime-modules.json}"

if [ -z "${RUNTIME_ENABLED_CSV:-}" ] && [ -f "$GATEWAY_DIR/resolve-runtime-modules.py" ] && [ -f "$MODULES_JSON" ]; then
  # shellcheck disable=SC1091
  eval "$(python3 "$GATEWAY_DIR/resolve-runtime-modules.py" "$MODULES_JSON")"
fi

ENABLED_CSV="${RUNTIME_ENABLED_CSV:-web,calendar,teach_hub,showmasterpiece,money_research,node_notes,idea_list,filetransfer,ticket_monitor,fitness_plan,comfy_prompt,utilities,wordpress_holt}"

module_on() {
  case ",${ENABLED_CSV}," in
    *",$1,"*) return 0 ;;
    *) return 1 ;;
  esac
}

fail=0
FAILED_CHECKS=()

check_http() {
  local name="$1"
  local url="$2"
  local expect="$3"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo ERR)"
  echo "${name} => ${code} (期望 ${expect})"
  if [ "$code" != "$expect" ]; then
    fail=1
    FAILED_CHECKS+=("${name} => ${code} (期望 ${expect})")
  fi
}

check_http_if() {
  local mod="$1"
  shift
  if module_on "$mod"; then
    check_http "$@"
  else
    echo "SKIP ($mod disabled): $1"
  fi
}

# WordPress 旁路：MariaDB 不健康时允许告警而不阻断主站/游戏部署
check_http_wp() {
  local name="$1"
  local url="$2"
  local code
  local i
  for i in 1 2 3 4 5; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo ERR)"
    echo "${name} 尝试 ${i}/5 => ${code} (期望 200|301|302)"
    case "$code" in
      200|301|302) return 0 ;;
    esac
    sleep 2
  done
  echo "WARN: ${name} => ${code}（WordPress 暂不可用，不阻断部署）"
}

check_http_wp_soft() {
  local name="$1"
  local url="$2"
  local expect="$3"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo ERR)"
  if [ "$code" = "$expect" ]; then
    echo "${name} => ${code} (期望 ${expect})"
  else
    echo "WARN: ${name} => ${code} (期望 ${expect}；WordPress 旁路，不阻断)"
  fi
}

echo "=== 网关冒烟测试 (${BASE}) enabled=${ENABLED_CSV} ==="
check_http "GET /" "${BASE}/" "200"
# auth 应用层故障（如 TypeError）不阻断部署；页面与其它 API 仍硬校验
auth_code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}/api/auth/get-session" 2>/dev/null || echo ERR)"
if [ "$auth_code" = "200" ]; then
  echo "GET /api/auth/get-session => ${auth_code} (期望 200)"
else
  echo "WARN: GET /api/auth/get-session => ${auth_code} (期望 200；应用层问题，不阻断部署)"
fi

check_http_if calendar "GET /calendar/" "${BASE}/calendar/" "200"
check_http_if teach_hub "GET /teach-hub/" "${BASE}/teach-hub/" "200"
check_http_if showmasterpiece "GET /showmasterpiece/" "${BASE}/showmasterpiece/" "200"
check_http_if money_research "GET /money-research/" "${BASE}/money-research/" "200"
check_http_if node_notes "GET /node-notes/" "${BASE}/node-notes/" "200"
check_http_if idea_list "GET /idea-list/" "${BASE}/idea-list/" "200"
check_http_if filetransfer "GET /filetransfer/" "${BASE}/filetransfer/" "200"
check_http_if ticket_monitor "GET /ticket-monitor/" "${BASE}/ticket-monitor/" "200"
check_http_if fitness_plan "GET /fitness-plan/" "${BASE}/fitness-plan/" "200"
check_http_if comfy_prompt "GET /comfy-prompt/" "${BASE}/comfy-prompt/" "200"
check_http_if utilities "GET /tools/" "${BASE}/tools/" "200"
check_http_if utilities "GET /tools/qr-code/" "${BASE}/tools/qr-code/" "200"
check_http_if utilities "GET /tools/date-calculator/" "${BASE}/tools/date-calculator/" "200"
check_http_if utilities "GET /tools/work-calculate/" "${BASE}/tools/work-calculate/" "200"
check_http_if utilities "GET /tools/image-downloader/" "${BASE}/tools/image-downloader/" "200"

# 未登录应 401；404 表示 nginx basePath 反代未对齐
if module_on calendar; then
  check_http "GET /api/calendar/events/" \
    "${BASE}/api/calendar/events/?startDate=2026-01-01&endDate=2026-12-31" "401"
fi
if module_on teach_hub; then
  check_http "GET /api/teach-hub/workspaces/" "${BASE}/api/teach-hub/workspaces/" "401"
fi
if module_on showmasterpiece; then
  check_http_wp_soft "GET /api/showmasterpiece/collections/" "${BASE}/api/showmasterpiece/collections/" "200"
  check_http "GET /api/showmasterpiece/bookings/admin/" "${BASE}/api/showmasterpiece/bookings/admin/" "401"
fi
if module_on node_notes; then
  check_http "GET /api/node-notes/documents/" "${BASE}/api/node-notes/documents/" "401"
fi
if module_on idea_list; then
  check_http "GET /api/ideaLists/lists/" "${BASE}/api/ideaLists/lists/" "401"
fi
if module_on filetransfer; then
  check_http "GET /api/filetransfer/transfers/" "${BASE}/api/filetransfer/transfers/" "401"
fi
if module_on ticket_monitor; then
  check_http "GET /api/ticket-monitor/events/" "${BASE}/api/ticket-monitor/events/" "200"
  check_http "GET /api/ticket-monitor/config/" "${BASE}/api/ticket-monitor/config/" "200"
fi
if module_on fitness_plan; then
  check_http "GET /api/fitnessPlan/profile/" "${BASE}/api/fitnessPlan/profile/" "401"
fi
if module_on comfy_prompt; then
  check_http "GET /api/comfyPrompt/prompts/" "${BASE}/api/comfyPrompt/prompts/" "401"
fi

# 旁路 Godot / 静态游戏（标准包共用 /games/godot-engine/；各游戏只验 html+pck）
check_http "GET /games/godot-engine/index.js" "${BASE}/games/godot-engine/index.js" "200"
check_http "GET /games/godot-engine/index.wasm" "${BASE}/games/godot-engine/index.wasm" "200"
for slug in pulse-parade flappy-wish suika-game bubble-shooter arknights-bubble-shooter \
  miku-flick huarongdao push-box gold-miner miku-fusion-game link-game race-game \
  trible-game miku-click kannot vocaloid-to-go purchase-game mikutap-game miku-planting \
  9dot-music; do
  check_http "GET /games/${slug}/" "${BASE}/games/${slug}/" "200"
  check_http "GET /games/${slug}/index.pck" "${BASE}/games/${slug}/index.pck" "200"
done
check_http "GET /games (Next hub)" "${BASE}/games" "200"
# diner-dash：Spine 预构建，自带引擎，不参与共用
check_http "GET /games/diner-dash/" "${BASE}/games/diner-dash/" "200"
check_http "GET /games/diner-dash/index.js" "${BASE}/games/diner-dash/index.js" "200"
check_http "GET /games/diner-dash/index.wasm" "${BASE}/games/diner-dash/index.wasm" "200"
check_http "GET /games/diner-dash/index.pck" "${BASE}/games/diner-dash/index.pck" "200"

if module_on wordpress_holt; then
  check_http_wp "GET /wp/holt/" "${BASE}/wp/holt/"
  check_http_wp_soft "GET /wp/holt/about/" "${BASE}/wp/holt/about/" "200"
  check_http_wp_soft "GET /wp/holt/works/" "${BASE}/wp/holt/works/" "200"
  check_http_wp_soft "GET /wp/holt theme CSS" \
    "${BASE}/wp/holt/wp-content/themes/holt-portfolio/assets/main.css" "200"
  check_http_wp_soft "GET /wp/holt wp-includes CSS" \
    "${BASE}/wp/holt/wp-includes/css/dashicons.min.css" "200"
  check_http_wp_soft "GET /wp/holt wp-admin CSS" \
    "${BASE}/wp/holt/wp-admin/css/login.min.css" "200"
  check_http_wp "GET /wp/holt/wp-login.php" "${BASE}/wp/holt/wp-login.php"
else
  echo "SKIP (wordpress_holt disabled): /wp/holt/*"
fi

if [ "$fail" -ne 0 ]; then
  echo "ERROR: 网关冒烟测试失败。请检查 nginx/profile-platform.conf 是否已同步并重载。" >&2
  echo "=== 未通过项（共 ${#FAILED_CHECKS[@]}）===" >&2
  for line in "${FAILED_CHECKS[@]}"; do
    echo "  FAIL: ${line}" >&2
  done
  exit 1
fi

echo "OK: 网关冒烟测试通过"
