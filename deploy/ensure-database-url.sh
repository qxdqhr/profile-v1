#!/usr/bin/env bash
# 从 app.config.yaml 推导并校验容器用 DATABASE_URL（端口必须为 5432）
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-.}"
cd "$DEPLOY_DIR"

strip_env_value() {
  local v="${1:-}"
  v="${v%\"}"
  v="${v#\"}"
  v="${v%\'}"
  v="${v#\'}"
  printf '%s' "$v"
}

validate_database_url() {
  local url="$1"
  python3 - "$url" <<'PY'
import sys
from urllib.parse import urlparse

raw = sys.argv[1].strip()
u = urlparse(raw)
if u.scheme not in ("postgresql", "postgres"):
    raise SystemExit(1)
if not u.hostname:
    raise SystemExit(1)
if u.port != 5432:
    raise SystemExit(1)
if not u.path or u.path == "/":
    raise SystemExit(1)
PY
}

derive_database_url() {
  if [ -f ./derive-database-url.sh ] && [ -f app.config.yaml ]; then
    bash ./derive-database-url.sh app.config.yaml
  fi
}

# 1. 优先使用 app.config 推导（权威来源，避免沿用损坏的 .env）
if derived="$(derive_database_url 2>/dev/null || true)" && [ -n "$derived" ]; then
  if validate_database_url "$derived" 2>/dev/null; then
    printf '%s' "$derived"
    exit 0
  fi
fi

# 2. 回退已有 .env
if [ -f .env ]; then
  existing="$(strip_env_value "$(grep -E '^DATABASE_URL=' .env | tail -1 | cut -d= -f2- || true)")"
  if [ -n "$existing" ] && validate_database_url "$existing" 2>/dev/null; then
    printf '%s' "$existing"
    exit 0
  fi
fi

echo "ERROR: 无法获得有效的 DATABASE_URL（需 postgresql://...@host:5432/db）" >&2
exit 1
