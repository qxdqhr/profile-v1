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

# WordPress 安装前可能 302→install.php；就绪后 200。502/404 视为失败。
check_http_wp() {
  local name="$1"
  local url="$2"
  local code
  local i
  for i in 1 2 3 4 5 6 7 8 9 10; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo ERR)"
    echo "${name} 尝试 ${i}/10 => ${code} (期望 200|301|302)"
    case "$code" in
      200|301|302) return 0 ;;
    esac
    sleep 3
  done
  echo "${name} => ${code} (期望 200|301|302)"
  fail=1
}

echo "=== 网关冒烟测试 (${BASE}) ==="
check_http "GET /" "${BASE}/" "200"
check_http "GET /api/auth/get-session" "${BASE}/api/auth/get-session" "200"
check_http "GET /calendar/" "${BASE}/calendar/" "200"
check_http "GET /teach-hub/" "${BASE}/teach-hub/" "200"
check_http "GET /showmasterpiece/" "${BASE}/showmasterpiece/" "200"
check_http "GET /money-research/" "${BASE}/money-research/" "200"
check_http "GET /node-notes/" "${BASE}/node-notes/" "200"
# 未登录应 401；404 表示 nginx basePath 反代未对齐
check_http "GET /api/calendar/events/" \
  "${BASE}/api/calendar/events/?startDate=2026-01-01&endDate=2026-12-31" "401"
check_http "GET /api/teach-hub/workspaces/" "${BASE}/api/teach-hub/workspaces/" "401"
# showmasterpiece 画集列表 GET 为公开接口（未登录 200）；管理接口应 401
check_http "GET /api/showmasterpiece/collections/" "${BASE}/api/showmasterpiece/collections/" "200"
check_http "GET /api/showmasterpiece/bookings/admin/" "${BASE}/api/showmasterpiece/bookings/admin/" "401"
check_http "GET /api/node-notes/documents/" "${BASE}/api/node-notes/documents/" "401"
# 旁路 Godot / 静态游戏
check_http "GET /games/pulse-parade/" "${BASE}/games/pulse-parade/" "200"
check_http "GET /games/pulse-parade/index.wasm" "${BASE}/games/pulse-parade/index.wasm" "200"
check_http "GET /games/pulse-parade/index.pck" "${BASE}/games/pulse-parade/index.pck" "200"
check_http "GET /games/flappy-wish/" "${BASE}/games/flappy-wish/" "200"
check_http "GET /games/flappy-wish/index.wasm" "${BASE}/games/flappy-wish/index.wasm" "200"
check_http "GET /games/flappy-wish/index.pck" "${BASE}/games/flappy-wish/index.pck" "200"
check_http "GET /games/suika-game/" "${BASE}/games/suika-game/" "200"
check_http "GET /games/suika-game/index.wasm" "${BASE}/games/suika-game/index.wasm" "200"
check_http "GET /games/suika-game/index.pck" "${BASE}/games/suika-game/index.pck" "200"

# 旁路 WordPress（纯 PHP；未安装也可能 302）
check_http_wp "GET /wp/holt/" "${BASE}/wp/holt/"
check_http "GET /wp/holt/about/" "${BASE}/wp/holt/about/" "200"
check_http "GET /wp/holt/works/" "${BASE}/wp/holt/works/" "200"
check_http "GET /wp/holt theme CSS" \
  "${BASE}/wp/holt/wp-content/themes/holt-portfolio/assets/main.css" "200"
check_http "GET /wp/holt wp-includes CSS" \
  "${BASE}/wp/holt/wp-includes/css/dashicons.min.css" "200"
check_http "GET /wp/holt wp-admin CSS" \
  "${BASE}/wp/holt/wp-admin/css/login.min.css" "200"
check_http_wp "GET /wp/holt/wp-login.php" "${BASE}/wp/holt/wp-login.php"

if [ "$fail" -ne 0 ]; then
  echo "ERROR: 网关冒烟测试失败。请检查 nginx/profile-platform.conf 是否已同步并重载。" >&2
  exit 1
fi

echo "OK: 网关冒烟测试通过"
