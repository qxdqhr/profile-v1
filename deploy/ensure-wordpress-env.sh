#!/usr/bin/env bash
# 确保服务器 .env 含 WordPress/MariaDB 必要键（幂等；不覆盖已有非空值）
# 密码类变量必须由 CI Secret 或已有 .env 提供，禁止写入弱口令占位。
set -euo pipefail

ENV_FILE="${1:-.env}"
touch "$ENV_FILE"

read_key() {
  local key="$1"
  local from_env
  from_env="$(printenv "$key" || true)"
  if [ -n "$from_env" ]; then
    printf '%s' "$from_env"
    return 0
  fi
  if grep -qE "^${key}=" "$ENV_FILE" 2>/dev/null; then
    grep -E "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2-
    return 0
  fi
  printf '%s' ''
}

is_weak_secret() {
  local value="$1"
  if [ -z "$value" ]; then
    return 0
  fi
  if [ "$value" = "change-me-root" ] || [ "$value" = "change-me-wp" ] || [ "$value" = "changeme" ] || [ "$value" = "password" ] || [ "$value" = "root" ]; then
    return 0
  fi
  return 1
}

upsert_if_missing() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "$ENV_FILE" 2>/dev/null; then
    local cur
    cur="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2-)"
    if [ -n "$cur" ]; then
      return 0
    fi
    grep -vE "^${key}=" "$ENV_FILE" > "${ENV_FILE}.tmp" || true
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
  fi
  printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
}

ROOT_PW="$(read_key MARIADB_ROOT_PASSWORD)"
DB_PW="$(read_key WORDPRESS_DB_PASSWORD)"
if is_weak_secret "$ROOT_PW" || is_weak_secret "$DB_PW"; then
  echo "ERROR: MARIADB_ROOT_PASSWORD / WORDPRESS_DB_PASSWORD 未配置或仍为弱口令占位" >&2
  echo "请通过 GitHub Secrets 或服务器 .env 提供强密码后再部署 WordPress 旁路。" >&2
  exit 1
fi

upsert_if_missing WORDPRESS_DB_USER "${WORDPRESS_DB_USER:-wp}"
upsert_if_missing WORDPRESS_DB_NAME "${WORDPRESS_DB_NAME:-wp_holt}"
if [ -n "${WP_HOLT_PUBLIC_URL:-}" ]; then
  upsert_if_missing WP_HOLT_PUBLIC_URL "$WP_HOLT_PUBLIC_URL"
fi

echo "OK: WordPress env keys present in ${ENV_FILE}"
