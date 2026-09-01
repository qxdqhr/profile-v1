# 新增 Godot / 静态游戏旁路

每站 = 独立 nginx 静态容器 + 网关一条前缀 location + `www/` 导出物。  
**不要**塞进 `apps/*`；**不要**为每个静态文件再加 location。

假设 slug = `my-game`（URL：`/games/my-game/`）。

## 1. 目录

```
deploy/games/my-game/
  nginx.conf          # wasm MIME + gzip（可复制 pulse-parade）
  www/                # Godot export/web 产物（含 index.html）
```

## 2. compose

在 `docker-compose.gateway.yml` 增加：

```yaml
  game_my_game:
    image: docker.m.daocloud.io/library/nginx:1.27-alpine
    restart: unless-stopped
    volumes:
      - ./games/my-game/www:/usr/share/nginx/html:ro
      - ./games/my-game/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - profile
```

`nginx.depends_on` 追加该服务。

## 3. 网关 nginx

```nginx
location = /games/my-game { return 301 /games/my-game/; }
location /games/my-game/ {
    set $game_my_game_upstream game_my_game;
    rewrite ^/games/my-game/(.*)$ /$1 break;
    proxy_pass http://$game_my_game_upstream;
    include /etc/nginx/proxy-params.conf;
}
```

## 4. CI

`docker-build-push.yml` 的 `deploy-web`：`mkdir` + `scp -r deploy/games/my-game` 到服务器 `/root/profile-v1/games/my-game/`。

## 5. 冒烟

`smoke-test-gateway.sh` 增加：

- `GET /games/my-game/` → 200
- `GET /games/my-game/index.wasm` → 200（且 ideally `Content-Type: application/wasm`）

## 清单

| slug | 服务名 | 路径 | 备注 |
|------|--------|------|------|
| pulse-parade | `game_pulse_parade` | `/games/pulse-parade/` | Godot 4.7 单线程 Web |
