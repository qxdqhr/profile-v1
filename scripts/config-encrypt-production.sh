#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PLAIN="$ROOT/config/app.config.production.plain.yaml"
ENC="$ROOT/config/production.enc.yaml"
KEY_FILE="${SOPS_AGE_KEY_FILE:-$ROOT/config/keys/age-key.txt}"

if [[ ! -f "$PLAIN" ]]; then
  echo "缺少 $PLAIN，请先运行 ./scripts/config-sops-init.sh" >&2
  exit 1
fi

if [[ ! -f "$KEY_FILE" ]]; then
  echo "缺少 age 私钥 $KEY_FILE" >&2
  exit 1
fi

ensure_sops() {
  if command -v sops >/dev/null 2>&1 && sops --version >/dev/null 2>&1; then
    return 0
  fi
  if [[ -x "$HOME/.local/bin/sops" ]] && "$HOME/.local/bin/sops" --version >/dev/null 2>&1; then
    export PATH="$HOME/.local/bin:$PATH"
    return 0
  fi
  return 1
}

if ensure_sops; then
  export SOPS_AGE_KEY_FILE="$KEY_FILE"
  sops -e "$PLAIN" > "$ENC"
  echo "已用 sops 加密 → $ENC"
else
  echo "未找到 sops，使用 age 直接加密（解密脚本同样支持）" >&2
  PUBKEY="$(grep '^# public key:' "$KEY_FILE" | cut -d: -f2- | xargs)"
  age -r "$PUBKEY" -o "$ENC" "$PLAIN"
  echo "已用 age 加密 → $ENC"
fi

echo "大小: $(wc -c < "$ENC") bytes"
