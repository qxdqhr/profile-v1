#!/usr/bin/env bash
# 紧急清理 Docker 磁盘，恢复网关部署空间（不删 named volume 数据）
set -euo pipefail

echo "=== 清理前磁盘 ==="
df -h / | tail -1
docker system df 2>/dev/null || true

echo "=== 停止悬空容器并 prune ==="
docker container prune -f || true
docker image prune -af || true
docker builder prune -af || true
docker network prune -f || true
# 不 prune volumes：避免误删 wp_mariadb_data / 业务卷

echo "=== 清理后磁盘 ==="
df -h / | tail -1
docker system df 2>/dev/null || true
echo "OK: disk cleanup done"
