#!/usr/bin/env bash
# 紧急清理 Docker 磁盘，恢复网关部署空间（不删 named volume 数据）
set -euo pipefail

# shellcheck source=./_lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_lib.sh"
cd "$DEPLOY_DIR"

echo "=== 清理前磁盘 ==="
df -h / | tail -1
docker system df 2>/dev/null || true

echo "=== 停止悬空容器并 prune ==="
docker container prune -f || true
# 只用 dangling prune，保留已打 tag 的 nginx/MariaDB/WordPress 基础镜像。
# 此前 `image prune -af` 会在 compose down 后清掉这些层，随后 DaoCloud TLS 不稳时 redeploy 必挂。
docker image prune -f || true
docker builder prune -af --filter "until=72h" || true
docker network prune -f || true
# 不 prune volumes：避免误删 wp_mariadb_data / 业务卷

echo "=== 清理后磁盘 ==="
df -h / | tail -1
docker system df 2>/dev/null || true
echo "OK: disk cleanup done"
