# 单容器 → 网关三应用迁移 Runbook

> 将现有 `my_container`（仅 web）迁移为 nginx 统一入口 + 三应用容器。

## 前置条件

- ST-17 镜像已 push：`qhr-profile-web`、`qhr-profile-calendar`、`qhr-profile-teach-hub`
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
| `/api/auth/` | web:3000 | **共享 session**（子应用不单独登录） |

Legacy：`/testField/calendar`、`/testField/teachHub` → nginx 301 至新路径。

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
curl -I http://127.0.0.1:3000/api/auth/get-session
```

若 `get-session` 返回 500，多为 **web 容器连不上 Postgres**。容器经公网域名访问本机 DB 常会 hairpin 失败，请在 `/root/profile-v1/.env` 增加：

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host.docker.internal:5432/exam_system
```

然后 `docker-compose -f docker-compose.gateway.yml up -d` 并查看 `docker-compose logs web --tail 50`。

## Auth / Cookie

- 三应用共用 `auth.publicUrl`（主站 URL，如 `https://qhr062.top`）
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
```

模拟网关需先构建镜像并设置 `deploy/.env` 后：

```bash
cd deploy
docker compose -f docker-compose.gateway.yml up -d
```

## HTTPS

若前置 TLS 终止于 CDN/外层 nginx，确保转发 `X-Forwarded-Proto: https`，并令 `auth.url` / `publicUrl` 使用 `https://`。
