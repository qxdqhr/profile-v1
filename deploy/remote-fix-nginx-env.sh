#!/usr/bin/env bash
# 服务器端一键修复：.env 三重引号 + 内层 testField https 重定向 + 外层 proxy_redirect
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"
OUTER_NGINX="${OUTER_NGINX:-/etc/nginx/sites-enabled/nextjs-https}"

cd "$DEPLOY_DIR"

compose() {
  if docker compose version >/dev/null 2>&1; then docker compose "$@";
  else docker-compose "$@"; fi
}

echo "========== 1. 修复 .env =========="
sed -i '/^DATABASE_URL=/d' .env
echo 'DATABASE_URL=postgresql://postgres:6trt7%5ER4ey7%40@host.docker.internal:5432/exam_system' >> .env
cat -n .env

echo
echo "========== 2. 同步内层 nginx 配置（含 API basePath 反代）=========="
chmod 644 nginx/profile-platform.conf
if [ -f nginx/profile-platform.conf ]; then
  grep -A2 'location /api/calendar/' nginx/profile-platform.conf || true
else
  echo "WARN: 缺少 nginx/profile-platform.conf"
fi
sed -i 's|return 301 /calendar/$1;|return 301 https://$http_host/calendar/$1;|' nginx/profile-platform.conf 2>/dev/null || true
sed -i 's|return 301 /teach-hub/$1;|return 301 https://$http_host/teach-hub/$1;|' nginx/profile-platform.conf 2>/dev/null || true

echo
echo "========== 3. 外层 nginx proxy_redirect =========="
if [ -f "$OUTER_NGINX" ] && ! grep -q 'proxy_redirect' "$OUTER_NGINX"; then
  sed -i '/proxy_set_header X-Forwarded-Proto/a\        proxy_redirect http:// https://;' "$OUTER_NGINX"
  echo "已追加 proxy_redirect"
fi
nginx -t
systemctl reload nginx

echo
echo "========== 4. 重启网关栈 =========="
compose -f "$COMPOSE_FILE" down --remove-orphans
compose -f "$COMPOSE_FILE" up -d
sleep 15
compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload

echo
echo "========== 5. 验证 =========="
curl -sSI https://qhr062.top/testField/teachHub | grep -i '^location:' || true
curl -sS http://127.0.0.1:3000/api/auth/get-session; echo
CAL_CODE="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3000/api/calendar/events/?startDate=2026-01-01&endDate=2026-12-31' || echo ERR)"
echo "GET /api/calendar/events/ => ${CAL_CODE} (期望 401；404 表示 API 路由仍错误)"
compose -f "$COMPOSE_FILE" ps
