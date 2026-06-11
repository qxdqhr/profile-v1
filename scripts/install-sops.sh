#!/usr/bin/env bash
# 安装 sops 到 ~/.local/bin（openSUSE 官方源通常无 sops 包）
set -euo pipefail

BIN_DIR="${HOME}/.local/bin"
SOPS_VERSION="${SOPS_VERSION:-3.9.4}"
SOPS_URL="https://github.com/getsops/sops/releases/download/v${SOPS_VERSION}/sops-v${SOPS_VERSION}.linux.amd64"
TARGET="${BIN_DIR}/sops"

mkdir -p "$BIN_DIR"

if command -v sops >/dev/null 2>&1; then
  echo "sops 已安装: $(command -v sops)"
  sops --version
  exit 0
fi

echo "正在下载 sops v${SOPS_VERSION} → ${TARGET}"

download() {
  curl -fsSL --connect-timeout 20 --retry 5 --retry-delay 3 -o "${TARGET}.tmp" "$1"
}

if download "$SOPS_URL"; then
  :
elif download "https://ghproxy.net/${SOPS_URL}"; then
  :
elif download "https://mirror.ghproxy.com/${SOPS_URL}"; then
  :
else
  echo "下载失败。请手动下载并 chmod +x:" >&2
  echo "  $SOPS_URL" >&2
  exit 1
fi

chmod +x "${TARGET}.tmp"
mv "${TARGET}.tmp" "$TARGET"

echo "安装完成。请将 ~/.local/bin 加入 PATH："
echo '  export PATH="$HOME/.local/bin:$PATH"  # 写入 ~/.zshrc'
"$TARGET" --version
