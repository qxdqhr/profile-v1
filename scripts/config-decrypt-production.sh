#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENC="$ROOT/config/production.enc.yaml"
OUT="${1:-$ROOT/config/app.config.production.yaml}"
KEY_FILE="${SOPS_AGE_KEY_FILE:-$ROOT/config/keys/age-key.txt}"

if [[ ! -f "$ENC" ]]; then
  echo "缺少 $ENC，请先运行 ./scripts/config-encrypt-production.sh" >&2
  exit 1
fi

if [[ ! -f "$KEY_FILE" ]]; then
  echo "缺少 age 私钥 $KEY_FILE" >&2
  exit 1
fi

if [[ ! -s "$ENC" ]]; then
  echo "$ENC 为空，请先加密生产配置" >&2
  exit 1
fi

# age 直加密文件以 age-encryption.org 开头；sops 为 YAML 含 ENC[...]
if head -c 20 "$ENC" | grep -q 'age-encryption.org'; then
  age -d -i "$KEY_FILE" -o "$OUT" "$ENC"
else
  if ! command -v sops >/dev/null 2>&1 && [[ -x "$HOME/.local/bin/sops" ]]; then
    export PATH="$HOME/.local/bin:$PATH"
  fi
  if ! command -v sops >/dev/null 2>&1; then
    echo "此文件为 sops 格式，请安装 sops: ./scripts/install-sops.sh" >&2
    exit 1
  fi
  export SOPS_AGE_KEY_FILE="$KEY_FILE"
  sops -d "$ENC" > "$OUT"
fi

chmod 600 "$OUT"
echo "已解密 → $OUT"
