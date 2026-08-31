#!/usr/bin/env bash
# 幂等创建 WordPress MariaDB 库（多 slug / 迁库时 wp_mariadb 已初始化过）
set -euo pipefail

ENV_FILE="${1:-.env}"
COMPOSE_FILE="${2:-docker-compose.gateway.yml}"

if [ ! -f "$ENV_FILE" ]; then
  echo "WARN: ${ENV_FILE} 不存在，跳过 WordPress 建库" >&2
  exit 0
fi

# shellcheck disable=SC1090
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

DB_NAME="${WORDPRESS_DB_NAME:-wp_holt}"
DB_USER="${WORDPRESS_DB_USER:-wp}"
ROOT_PW="${MARIADB_ROOT_PASSWORD:-}"

if [ -z "$ROOT_PW" ] || [ "$ROOT_PW" = "change-me-root" ]; then
  echo "WARN: MARIADB_ROOT_PASSWORD 未配置或为占位，跳过建库 ${DB_NAME}" >&2
  exit 0
fi

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "WARN: 无 docker compose，跳过建库" >&2
    exit 0
  fi
}

if ! compose_cmd -f "$COMPOSE_FILE" ps --status running wp_mariadb 2>/dev/null | grep -q wp_mariadb; then
  echo "WARN: wp_mariadb 未运行，跳过建库 ${DB_NAME}" >&2
  exit 0
fi

echo "=== 确保 MariaDB 库 ${DB_NAME} 存在 ==="
compose_cmd -f "$COMPOSE_FILE" exec -T wp_mariadb \
  mariadb -uroot -p"${ROOT_PW}" \
  -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      GRANT ALL ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
      FLUSH PRIVILEGES;"
echo "OK: ${DB_NAME}"
