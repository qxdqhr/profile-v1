#!/usr/bin/env bash
# 确保服务器 .env 含 WordPress/MariaDB 必要键（幂等；不覆盖已有非空值）
# 可由 CI 在 deploy-profile-v1.sh 之前注入环境变量，或本脚本从已有 .env 补全默认值。
set -euo pipefail

ENV_FILE="${1:-.env}"
touch "$ENV_FILE"

upsert_if_missing() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "$ENV_FILE" 2>/dev/null; then
    local cur
    cur="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2-)"
    if [ -n "$cur" ]; then
      return 0
    fi
    # 空值则替换
    grep -vE "^${key}=" "$ENV_FILE" > "${ENV_FILE}.tmp" || true
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
  fi
  printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
}

# 优先使用当前环境（CI / 手工 export），否则写安全占位（生产务必改密）
upsert_if_missing MARIADB_ROOT_PASSWORD "${MARIADB_ROOT_PASSWORD:-change-me-root}"
upsert_if_missing WORDPRESS_DB_USER "${WORDPRESS_DB_USER:-wp}"
upsert_if_missing WORDPRESS_DB_PASSWORD "${WORDPRESS_DB_PASSWORD:-change-me-wp}"
upsert_if_missing WORDPRESS_DB_NAME "${WORDPRESS_DB_NAME:-wp_holt}"
upsert_if_missing WP_HOLT_PUBLIC_URL "${WP_HOLT_PUBLIC_URL:-https://qhr062.top/wp/holt}"

echo "OK: WordPress env keys present in ${ENV_FILE}"
