#!/usr/bin/env bash
# 服务器资源与登录链路巡检（CI / 手动 SSH 均可运行）
set -euo pipefail

echo "========== 时间 / 负载 =========="
date -Is || date
uptime

echo ""
echo "========== 磁盘 =========="
df -h
echo ""
df -i | head -20

echo ""
echo "========== 内存 =========="
free -h

echo ""
echo "========== 内存占用 Top10 =========="
ps aux --sort=-%mem 2>/dev/null | head -11 || ps -eo pid,pcpu,pmem,comm --sort=-%mem | head -11

echo ""
echo "========== Docker 磁盘 =========="
docker system df 2>/dev/null || echo "WARN: docker 不可用"

echo ""
echo "========== 网关容器 =========="
DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"
cd "$DEPLOY_DIR" 2>/dev/null || { echo "WARN: 无 $DEPLOY_DIR"; exit 0; }

compose() {
  if docker compose version >/dev/null 2>&1; then docker compose "$@";
  else docker-compose "$@"; fi
}

compose -f "$COMPOSE_FILE" ps 2>/dev/null || true

echo ""
echo "========== web 最近日志 =========="
compose -f "$COMPOSE_FILE" logs web --tail=40 2>&1 || true

echo ""
echo "========== 本机 auth 探测 =========="
curl -sS -o /dev/null -w "GET /api/auth/get-session => %{http_code}\n" http://127.0.0.1:3000/api/auth/get-session || true

echo ""
echo "========== Postgres 探测 =========="
if [ -f .env ]; then
  DB_URL="$(grep '^DATABASE_URL=' .env | tail -1 | sed -E 's/^DATABASE_URL=//' | tr -d '"')"
  HOST_DB_URL="${DB_URL/@host.docker.internal/@127.0.0.1}"
  if command -v psql >/dev/null 2>&1; then
    psql "$HOST_DB_URL" -c 'SELECT 1 AS ok' 2>&1 || true
    psql "$HOST_DB_URL" -c 'SELECT count(*) AS sessions FROM "session"' 2>&1 || true
  else
    docker run --rm postgres:16-alpine psql "$HOST_DB_URL" -c 'SELECT 1 AS ok' 2>&1 || true
  fi
fi

echo ""
echo "========== 巡检完成 =========="
