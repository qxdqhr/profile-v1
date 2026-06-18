#!/usr/bin/env bash
# 从 app.config.yaml 生成容器内可用的 DATABASE_URL（host.docker.internal）
set -euo pipefail

CONFIG_PATH="${1:-app.config.yaml}"

if [ ! -f "$CONFIG_PATH" ]; then
  echo "ERROR: 找不到 $CONFIG_PATH" >&2
  exit 1
fi

RAW="$(grep -E '^\s*url:\s*' "$CONFIG_PATH" | head -1 | sed -E 's/^\s*url:\s*//' | tr -d "\"'" )"
if [ -z "$RAW" ]; then
  echo "ERROR: database.url 缺失" >&2
  exit 1
fi

python3 - "$RAW" <<'PY'
import sys
from urllib.parse import quote

raw = sys.argv[1].strip()
prefix = "postgresql://"
if not raw.startswith(prefix):
    raise SystemExit(f"不支持的 database.url: {raw}")

rest = raw[len(prefix):]
userpass, hostpart = rest.rsplit("@", 1)
user, password = userpass.split(":", 1)
host, port_db = hostpart.split(":", 1)
encoded = quote(password, safe="")
print(f"{prefix}{user}:{encoded}@host.docker.internal:{port_db}")
PY
