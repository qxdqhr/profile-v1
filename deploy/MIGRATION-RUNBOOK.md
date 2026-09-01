# 单容器 → 网关多应用迁移 Runbook

> 将现有 `my_container`（仅 web）迁移为 nginx 统一入口 + **五 Web 应用**容器（web / calendar / teach-hub / showmasterpiece / money-research）。

## 前置条件

- ST-17 镜像已 push：`qhr-profile-web`、`qhr-profile-calendar`、`qhr-profile-teach-hub`、`qhr-profile-showmasterpiece`、`qhr-profile-money-research`
- 服务器已安装 Docker Compose v2
- 生产配置 `/root/profile-v1/app.config.yaml` 可用

## 路由表（同域）

| 路径 | upstream | 说明 |
|------|----------|------|
| `/` | web:3000 | 主站 |
| `/calendar/` | calendar:3001 | `NEXT_PUBLIC_BASE_PATH=/calendar` |
| `/api/calendar/` | calendar:3001 | API |
| `/teach-hub/` | teach_hub:3002 | `NEXT_PUBLIC_BASE_PATH=/teach-hub` |
| `/api/teach-hub/` | teach_hub:3002 | API |
| `/showmasterpiece/` | showmasterpiece:3003 | `NEXT_PUBLIC_BASE_PATH=/showmasterpiece` |
| `/api/showmasterpiece/` | showmasterpiece:3003 | API |
| `/money-research/` | money_research:3004 | `NEXT_PUBLIC_BASE_PATH=/money-research` |
| `/node-notes/` | node_notes:3005 | `NEXT_PUBLIC_BASE_PATH=/node-notes` |
| `/api/node-notes/` | node_notes:3005 | API |
| `/wp/holt/` | wordpress_holt:80 | **Holt 音乐作品集**（旁路 WordPress + `holt-portfolio` 主题） |
| `/games/pulse-parade/` | game_pulse_parade:80 | **Pulse Parade**（旁路 Godot Web） |
| `/games/flappy-wish/` | game_flappy_wish:80 | **予愿飞翔**（旁路 Godot Web） |
| `/games/suika-game/` | game_suika_game:80 | **合成大西瓜**（旁路 Godot Web） |
| `/games/bubble-shooter/` | game_bubble_shooter:80 | **泡泡龙**（旁路 Godot Web） |
| `/games/arknights-bubble-shooter/` | game_arknights_bubble_shooter:80 | **岁家龙泡泡**（旁路 Godot Web） |
| `/games/miku-flick/` | game_miku_flick:80 | **Miku Flick**（旁路 Godot Web） |
| `/games/huarongdao/` | game_huarongdao:80 | **华容道**（旁路 Godot Web） |
| `/games/push-box/` | game_push_box:80 | **推箱子**（旁路 Godot Web） |
| `/games/gold-miner/` | game_gold_miner:80 | **黄金矿工**（旁路 Godot Web） |
| `/games/miku-fusion-game/` | game_miku_fusion_game:80 | **Miku Fusion**（旁路 Godot Web） |
| `/api/auth/` | web:3000 | **共享 session**（Next 子应用不单独登录） |

Legacy：`/testField/calendar`、`/testField/teachHub` → nginx 301 至新路径；`/testField/ShowMasterPieces` → 301 至 `/showmasterpiece`。

### WordPress 旁路（`/wp/*`）

- 纯 PHP 前台+后台，**不**进 pnpm / Next CI matrix。
- 独立 MariaDB（`wp_mariadb` volume），与宿主机 Postgres 隔离。
- 首期站点：`/wp/holt/`（后台 `/wp/holt/wp-admin/`；旧 `/wp/personal/` 301 至 holt）。
- 多主题站：复制实例，路径 `/wp/<slug>/`；规程见 [`wordpress/ADD-SITE.md`](./wordpress/ADD-SITE.md)。
- 服务器 `.env` 需含 `MARIADB_ROOT_PASSWORD`、`WORDPRESS_DB_*`、`WP_HOLT_PUBLIC_URL`（`deploy-profile-v1.sh` 会保留这些键）。
- GitHub Secrets（可选，CI 注入）：`WP_MARIADB_ROOT_PASSWORD`、`WP_DB_USER`、`WP_DB_PASSWORD`、`WP_HOLT_PUBLIC_URL`。
- 仅改 `deploy/**`（无镜像重建）时，`deploy-web` 仍会执行（workflow 已处理 `build` skipped）。
- 本地验证：`cd deploy/wordpress && docker compose -f docker-compose.dev.yml --env-file .env up -d` → http://127.0.0.1:18080/wp/holt/

### Godot / 静态游戏旁路（`/games/*`）

- 源码：`games/<slug>/`；纯静态 nginx，**不**进 Next CI matrix。
- `www/` 由 Actions `export-godot-games` 生成后 scp（不进 git）。
- 现网含 `/games/miku-flick/` 等（Godot 4 单线程 Web）；完整清单见 `deploy/games/README.md`。
- **双轨**：原版 testField 先保留；计划见 [`games/GODOT-REWRITE-PLAN.md`](./games/GODOT-REWRITE-PLAN.md)；加站 [`games/ADD-GAME.md`](./games/ADD-GAME.md)。

## 目录布局（服务器 `/root/profile-v1`）

```
/root/profile-v1/
├── app.config.yaml
├── docker-compose.gateway.yml
├── .env
└── nginx/
    ├── profile-platform.conf
    └── proxy-params.conf
```

本地 WordPress 独立调试（无 Next）：见 [`wordpress/README.md`](./wordpress/README.md)。

## 日常发布（推 main 即可，无需手改 nginx）

推送到 `main` 后，GitHub Actions `Build and Push Docker Images` 会自动：

1. 构建并推送 `web` / `calendar` / `teach-hub` / `showmasterpiece` / `money-research` 五镜像
2. `scp` 同步 `deploy/nginx/profile-platform.conf` 等到服务器 `/root/profile-v1/`
3. 执行 `deploy-profile-v1.sh`：拉镜像 → `compose up` → **nginx reload** → **冒烟测试**
4. 执行 `fix-gateway-remote.sh`（`POST_DEPLOY=1`）：幂等修复 Postgres / `DATABASE_URL`，**不再二次重启栈**

**你不需要每次手改 nginx**。此前需要手动修，是因为早期 `profile-platform.conf` 未考虑 Next `basePath`，且部署脚本未 reload nginx、也未在失败时阻断 CI。

仍可能需**一次性**在宿主机配置（非每次发布）：

- 外层 HTTPS nginx（`/etc/nginx/sites-enabled/`，参考 `deploy/nginx/outer-ubuntu-qhr062.conf`）
- Postgres 对 docker 网桥 `172.17.0.0/16` 放行（`fix-gateway-remote.sh` 首次会自动尝试）

冒烟测试期望：未登录时 `/api/calendar/events/` 返回 **401**（不是 404）。若 CI 失败，查看 Actions 日志中的 `smoke-test-gateway.sh` 输出。

## 首次迁移步骤

```bash
# 1. 本地或 CI 已解密 app.config.yaml
ssh root@YOUR_SERVER 'mkdir -p /root/profile-v1/nginx'

scp deploy/docker-compose.gateway.yml root@YOUR_SERVER:/root/profile-v1/
scp deploy/nginx/* root@YOUR_SERVER:/root/profile-v1/nginx/
scp /tmp/app.config.yaml root@YOUR_SERVER:/root/profile-v1/app.config.yaml

# 2. 写入 .env（IMAGE_TAG 与 CI run_number 一致）
ssh root@YOUR_SERVER "cat > /root/profile-v1/.env <<EOF
REGISTRY=crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht
IMAGE_TAG=YOUR_RUN_NUMBER
GATEWAY_PORT=3000
EOF"

# 3. 停旧容器
ssh root@YOUR_SERVER 'docker stop my_container || true; docker rm my_container || true'

# 4. 启动网关栈
ssh root@YOUR_SERVER 'cd /root/profile-v1 && docker compose -f docker-compose.gateway.yml pull && docker compose -f docker-compose.gateway.yml up -d'

# 5. 验证
curl -I http://127.0.0.1:3000/calendar
curl -I http://127.0.0.1:3000/teach-hub
curl -I http://127.0.0.1:3000/showmasterpiece
curl -I http://127.0.0.1:3000/api/auth/get-session
```

若 `get-session` 返回 500，多为 **web 容器连不上 Postgres**。容器经公网域名访问本机 DB 常会 hairpin 失败，请在 `/root/profile-v1/.env` 增加：

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host.docker.internal:5432/exam_system
```

密码含 `@`、`^` 等特殊字符时需 URL 编码（如 `@` → `%40`，`^` → `%5E`）。

然后 `docker-compose -f docker-compose.gateway.yml down && docker-compose -f docker-compose.gateway.yml up -d` 并查看 `docker-compose logs web --tail 50`。

### 若写入 DATABASE_URL 后仍 500（Linux 常见）

Docker 容器经 `host.docker.internal` 访问宿主机 Postgres 时，连接会落到 **docker 网桥 IP**（如 `172.17.0.1`），**不是** `127.0.0.1`。若 Postgres 仅监听 `127.0.0.1:5432`，容器内仍会连库失败。

1. 运行诊断脚本（仓库 `deploy/check-gateway-health.sh`，同步至服务器后）：

```bash
chmod +x /root/profile-v1/check-gateway-health.sh
/root/profile-v1/check-gateway-health.sh
```

2. 在宿主机调整 Postgres（路径因发行版而异，常见 `/etc/postgresql/*/main/` 或 `/var/lib/pgsql/data/`）：

```bash
# postgresql.conf
listen_addresses = 'localhost,172.17.0.1'   # 或 '*'

# pg_hba.conf 追加一行（按实际认证方式 md5/scram-sha-256）
host    all    all    172.17.0.0/16    scram-sha-256

systemctl reload postgresql   # 或 pg_ctl reload
```

3. 再次验证：

```bash
curl -sS http://127.0.0.1:3000/api/auth/get-session
# 未登录应返回 null JSON，而非 Internal Server Error
```

## Auth / Cookie

- 四 Web 应用共用 `auth.publicUrl`（主站 URL，如 `https://qhr062.top`）
- Session cookie 域为 apex 域名（如 `.qhr062.top` 或 `qhr062.top`），**路径 /** 全站可见
- 子应用浏览器请求 `/api/auth/*` 由 nginx 转发至 **web**，与 calendar/teach-hub API 分离
- 同域反代 **无 CORS**；勿将子应用 API 指到不同端口的外链

### app.config 建议（生产）

```yaml
auth:
  url: https://qhr062.top
  publicUrl: https://qhr062.top
  trustedOrigins:
    - https://qhr062.top
    # 方案 C 子域时追加 calendar.qhr062.top 等（见 ST-20）
```

## 回滚

```bash
cd /root/profile-v1
docker compose -f docker-compose.gateway.yml down
docker run -d -p 3000:3000 --name my_container --restart unless-stopped \
  -e APP_CONFIG_ENV=production \
  -v /root/profile-v1/app.config.yaml:/app/config/app.config.production.yaml:ro \
  crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht/qhr-profile-web:PREVIOUS_TAG
```

## 本地开发（可选）

独立端口开发（无 nginx）：

```bash
pnpm dev:web          # :3000
pnpm dev:calendar     # :3001
pnpm dev:teach-hub    # :3002
pnpm dev:showmasterpiece  # :3003
pnpm dev:money-research   # :3004
```

模拟网关需先构建镜像并设置 `deploy/.env` 后：

```bash
cd deploy
docker compose -f docker-compose.gateway.yml up -d
```

## HTTPS

若前置 TLS 终止于 CDN/外层 nginx，确保转发 `X-Forwarded-Proto: https`，并令 `auth.url` / `publicUrl` 使用 `https://`。
