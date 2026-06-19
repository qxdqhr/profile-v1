#!/usr/bin/env bash
# 服务器热修复：同步 nginx API basePath 反代并重启网关栈（无需重建镜像）
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/root/profile-v1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.gateway.yml}"

cd "$DEPLOY_DIR"

compose() {
  if docker compose version >/dev/null 2>&1; then docker compose "$@";
  else docker-compose "$@"; fi
}

echo "=== 1. 备份当前 nginx 配置 ==="
cp -a nginx/profile-platform.conf "nginx/profile-platform.conf.bak.$(date +%Y%m%d%H%M%S)"

echo "=== 2. 写入 API basePath 反代（若仓库已更新可改为 git pull）==="
cat > nginx/profile-platform.conf <<'NGINX'
# profile-platform 同域路径反代（方案 B）
# upstream 主机名与 deploy/docker-compose.gateway.yml 中 service 名一致

upstream profile_web {
    server web:3000;
    keepalive 32;
}

upstream profile_calendar {
    server calendar:3001;
    keepalive 16;
}

upstream profile_teach_hub {
    server teach_hub:3002;
    keepalive 16;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

map $http_x_forwarded_proto $forwarded_proto {
    default $http_x_forwarded_proto;
    ''      $scheme;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 52m;

    location ~ ^/testField/calendar/?(.*)$ {
        return 301 https://$http_host/calendar/$1;
    }
    location ~ ^/testField/teachHub/?(.*)$ {
        return 301 https://$http_host/teach-hub/$1;
    }

    location /api/calendar/ {
        proxy_pass http://profile_calendar/calendar/api/calendar/;
        include /etc/nginx/proxy-params.conf;
    }
    location = /api/calendar {
        return 301 /api/calendar/;
    }
    location /calendar {
        proxy_pass http://profile_calendar;
        include /etc/nginx/proxy-params.conf;
    }

    location /api/teach-hub/ {
        proxy_pass http://profile_teach_hub/teach-hub/api/teach-hub/;
        include /etc/nginx/proxy-params.conf;
    }
    location = /api/teach-hub {
        return 301 /api/teach-hub/;
    }
    location /teach-hub {
        proxy_pass http://profile_teach_hub;
        include /etc/nginx/proxy-params.conf;
    }

    location /api/auth/ {
        proxy_pass http://profile_web;
        include /etc/nginx/proxy-params.conf;
    }

    location / {
        proxy_pass http://profile_web;
        include /etc/nginx/proxy-params.conf;
    }
}
NGINX

echo "=== 3. 重启 nginx 容器 ==="
compose -f "$COMPOSE_FILE" up -d nginx
sleep 2
compose -f "$COMPOSE_FILE" exec -T nginx nginx -t
compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload

echo "=== 4. 验证 API（未登录应 401，404 表示仍失败）==="
CODE="$(curl -sS -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3000/api/calendar/events/?startDate=2026-01-01&endDate=2026-12-31' || echo ERR)"
echo "GET /api/calendar/events/ => ${CODE}"
if [ "$CODE" = "401" ]; then
  echo "OK: 日历 API 路由已修复（401 = 需登录，属正常）"
elif [ "$CODE" = "404" ]; then
  echo "FAIL: 仍为 404，请检查 calendar 容器日志"
  compose -f "$COMPOSE_FILE" logs calendar --tail=40
  exit 1
else
  echo "WARN: 意外状态码 ${CODE}"
fi

if [ -x ./check-gateway-health.sh ]; then
  ./check-gateway-health.sh
elif [ -f ./check-gateway-health.sh ]; then
  bash ./check-gateway-health.sh
fi
