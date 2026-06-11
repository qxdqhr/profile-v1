#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEY_DIR="$ROOT/config/keys"
KEY_FILE="$KEY_DIR/age-key.txt"
SOPS_BIN="${SOPS_BIN:-$(command -v sops || true)}"
AGE_KEYGEN="${AGE_KEYGEN:-$(command -v age-keygen || true)}"

mkdir -p "$KEY_DIR"

if [[ -z "$AGE_KEYGEN" ]]; then
  echo "请先安装 age（age-keygen）: https://github.com/FiloSottile/age" >&2
  exit 1
fi

if [[ ! -f "$KEY_FILE" ]]; then
  echo "生成 age 密钥: $KEY_FILE"
  age-keygen -o "$KEY_FILE"
  chmod 600 "$KEY_FILE"
fi

PUBKEY="$(grep '^# public key:' "$KEY_FILE" | cut -d: -f2- | xargs)"

cat > "$ROOT/config/.sops.yaml" <<EOF
creation_rules:
  - path_regex: production\\.enc\\.yaml\$
    age: ${PUBKEY}
EOF

echo "已写入 config/.sops.yaml（公钥: ${PUBKEY}）"

PLAIN="$ROOT/config/app.config.production.plain.yaml"
if [[ ! -f "$PLAIN" ]]; then
  cat > "$PLAIN" <<'YAML'
app:
  name: profile-v1
  env: production

database:
  url: postgresql://user:pass@host:5432/dbname
  poolSize: 10
  timeout: 5000
  sslMode: prefer

auth:
  secret: "REPLACE_WITH_RANDOM_SECRET_MIN_32_CHARS!!"
  url: https://qhr062.top
  publicUrl: https://qhr062.top
  trustedOrigins:
    - https://qhr062.top
    - https://www.qhr062.top
  logOtpInDev: false
  sms:
    provider: console

storage:
  aliyunOss:
    enabled: false
    region: oss-cn-beijing
    bucket: your-bucket
    accessKeyId: ""
    accessKeySecret: ""
    secure: true
    internal: false
YAML
  echo "已创建 $PLAIN（请填写真实值后加密）"
fi

if [[ -z "$SOPS_BIN" ]] || ! "$SOPS_BIN" --version >/dev/null 2>&1; then
  echo "未找到可用 sops（openSUSE 源通常无此包）。" >&2
  echo "可选：" >&2
  echo "  ./scripts/install-sops.sh          # 下载到 ~/.local/bin" >&2
  echo "  pnpm config:encrypt-production     # 无 sops 时用 age 加密（已支持）" >&2
  bash "$ROOT/scripts/config-encrypt-production.sh"
  exit 0
fi

export SOPS_AGE_KEY_FILE="$KEY_FILE"
"$SOPS_BIN" -e "$PLAIN" > "$ROOT/config/production.enc.yaml"
echo "已用 sops 生成 config/production.enc.yaml（密文，可提交 Git）"
echo "私钥请勿提交: $KEY_FILE"
