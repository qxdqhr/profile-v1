#!/usr/bin/env bash
# 审计宿主机外层 nginx：TLS 终止层是否正确转发 X-Forwarded-Proto 到 :3000 网关
set -euo pipefail

echo "========== 外层 nginx 审计 =========="

if ! command -v nginx >/dev/null 2>&1; then
  echo "WARN: 未安装宿主机 nginx"
  exit 0
fi

nginx -t 2>&1 || true

echo
echo "=== sites-enabled ==="
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true

echo
echo "=== 含 qhr062 / 3000 的配置片段 ==="
grep -RIn --include='*.conf' -E 'qhr062|proxy_pass.*3000|X-Forwarded-Proto' /etc/nginx 2>/dev/null | head -80 || true

echo
echo "=== 本机 :3000 网关探活 ==="
curl -sS -o /dev/null -w "127.0.0.1:3000 GET /api/auth/get-session => %{http_code}\n" \
  http://127.0.0.1:3000/api/auth/get-session || true

echo
echo "=== 经外层 HTTPS 的 auth 探活 ==="
curl -sS -o /dev/null -w "https://qhr062.top/api/auth/get-session => %{http_code}\n" \
  https://qhr062.top/api/auth/get-session || true

echo
echo "=== legacy 重定向是否落到 http（应为 https）==="
curl -sSI https://qhr062.top/testField/teachHub 2>&1 | grep -i '^location:' || true

echo
echo "=== 建议 ==="
echo "若 location 为 http://qhr062.top/...：在宿主机 nginx 的 proxy_pass 块加入："
echo "  proxy_set_header X-Forwarded-Proto \$scheme;"
echo "参考仓库 deploy/nginx/outer-ubuntu-qhr062.conf 与 proxy-params-outer.conf"
