#!/usr/bin/env bash
# 补齐 calendar_events 等表可能缺失的列（幂等）
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
cd "$DEPLOY_DIR"

if [ ! -f .env ]; then
  echo "WARN: 无 .env，跳过 calendar schema"
  exit 0
fi

if [ -x ./ensure-database-url.sh ]; then
  DB_URL="$(./ensure-database-url.sh)"
elif [ -f ./ensure-database-url.sh ]; then
  DB_URL="$(bash ./ensure-database-url.sh)"
else
  DB_URL="$(grep '^DATABASE_URL=' .env | tail -1 | cut -d= -f2- | tr -d '"')"
fi

# 宿主机执行时用 127.0.0.1 替代 host.docker.internal
HOST_DB_URL="${DB_URL/@host.docker.internal/@127.0.0.1}"

run_psql() {
  local sql="$1"
  if command -v psql >/dev/null 2>&1; then
    psql "$HOST_DB_URL" -v ON_ERROR_STOP=1 -c "$sql"
  else
    docker run --rm postgres:16-alpine psql "$HOST_DB_URL" -v ON_ERROR_STOP=1 -c "$sql"
  fi
}

echo "=== 确保 calendar_events.priority 列存在 ==="
run_psql "ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS priority varchar(10) NOT NULL DEFAULT 'normal';" \
  || echo "WARN: priority 列迁移失败（表可能尚未创建）"

echo "=== calendar schema 检查完成 ==="
