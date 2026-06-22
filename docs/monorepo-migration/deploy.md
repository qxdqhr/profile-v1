# Monorepo 部署说明（方案 B）

> 四 Web 应用独立镜像 + nginx 同域网关。详见 [MIGRATION-RUNBOOK.md](../../deploy/MIGRATION-RUNBOOK.md)。

## 网关路由（ST-18+）

| 路径 | upstream | 备注 |
|------|----------|------|
| `/` | web:3000 | 主站 |
| `/calendar/` | calendar:3001 | `NEXT_PUBLIC_BASE_PATH=/calendar` |
| `/api/calendar/` | calendar:3001 | |
| `/teach-hub/` | teach_hub:3002 | `NEXT_PUBLIC_BASE_PATH=/teach-hub` |
| `/api/teach-hub/` | teach_hub:3002 | |
| `/showmasterpiece/` | showmasterpiece:3003 | `NEXT_PUBLIC_BASE_PATH=/showmasterpiece` |
| `/api/showmasterpiece/` | showmasterpiece:3003 | |
| `/api/auth/` | web:3000 | 共享 session |

配置文件：`deploy/nginx/profile-platform.conf`  
Compose：`deploy/docker-compose.gateway.yml`

## 镜像与端口

| 应用 | Dockerfile | 镜像 tag（阿里云） | 容器端口 |
|------|------------|-------------------|----------|
| web（主站） | `apps/web/Dockerfile` | `qhr-profile-web:NNN` | 3000 |
| calendar | `apps/calendar/Dockerfile` | `qhr-profile-calendar:NNN` | 3001 |
| teach-hub | `apps/teach-hub/Dockerfile` | `qhr-profile-teach-hub:NNN` | 3002 |
| showmasterpiece | `apps/showmasterpiece/Dockerfile` | `qhr-profile-showmasterpiece:NNN` | 3003 |

**兼容**：CI 仍额外推送 `qhr-profile:NNN`（与 `qhr-profile-web:NNN` 相同层），供旧部署脚本过渡。

`NNN` = GitHub Actions `run_number`。

## 本地构建

构建上下文均为**仓库根目录**：

```bash
docker build -f apps/web/Dockerfile -t qhr-profile-web:local .
docker build -f apps/calendar/Dockerfile -t qhr-profile-calendar:local .
docker build -f apps/teach-hub/Dockerfile -t qhr-profile-teach-hub:local .
docker build -f apps/showmasterpiece/Dockerfile -t qhr-profile-showmasterpiece:local .
```

或使用根脚本（Calendar/TeachHub 可附带 RN APK）：

```bash
BUILD_ANDROID=0 pnpm package:calendar local
BUILD_ANDROID=0 pnpm package:teach-hub local
pnpm package:showmasterpiece local
```

根目录 `dockerfile` 等价于 `apps/web/Dockerfile`。

## 运行示例

```bash
docker run -d -p 3000:3000 \
  -e APP_CONFIG_ENV=production \
  -v $(pwd)/config/app.config.production.yaml:/app/config/app.config.production.yaml:ro \
  qhr-profile-web:local

docker run -d -p 3001:3001 \
  -e APP_CONFIG_ENV=production \
  -v $(pwd)/config/app.config.production.yaml:/app/config/app.config.production.yaml:ro \
  qhr-profile-calendar:local

docker run -d -p 3002:3002 \
  -e APP_CONFIG_ENV=production \
  -v $(pwd)/config/app.config.production.yaml:/app/config/app.config.production.yaml:ro \
  qhr-profile-teach-hub:local

docker run -d -p 3003:3003 \
  -e APP_CONFIG_ENV=production \
  -v $(pwd)/config/app.config.production.yaml:/app/config/app.config.production.yaml:ro \
  qhr-profile-showmasterpiece:local
```

## 环境变量（跨应用）

| 变量 | 应用 | 说明 |
|------|------|------|
| `APP_CONFIG_ENV=production` | 全部 | 加载 `/app/config/app.config.production.yaml` |
| `NEXT_PUBLIC_CALENDAR_URL` | web | 网关模式 `/calendar`；本地 dev `http://localhost:3001` |
| `NEXT_PUBLIC_TEACH_HUB_URL` | web | 网关模式 `/teach-hub`；本地 dev `http://localhost:3002` |
| `NEXT_PUBLIC_SHOWMASTERPIECE_URL` | web | 网关模式 `/showmasterpiece`；本地 dev `http://localhost:3003` |
| `NEXT_PUBLIC_BASE_PATH` | 子应用 | 网关 `/calendar`、`/teach-hub`、`/showmasterpiece`；独立 dev 留空 |

## CI

Workflow：`.github/workflows/docker-build-push.yml`

- **matrix** 并行构建并 push 四 Web 镜像
- **deploy-web** job：同步 compose + nginx，启动网关栈（替代单容器 `my_container`）

RN 客户端（非 Docker 网关栈）：

- `.github/workflows/calendar-mobile-release.yml`（tag `calendar-mobile-v*`）
- TeachHub Mobile 见 teach-hub 相关 workflow

## 体积优化

各 Dockerfile `deps` 阶段仅 `pnpm install --filter @profile/{app}...`，不安装 Phaser、aframe 等 web 专用依赖。

`@profile/db` schema 聚合引用各 `packages/*-core` 的 schema；部分 Dockerfile 仍 COPY `apps/web/src/modules` 以兼容历史构建路径。

## 注册表示例

```
crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht/qhr-profile-web:123
crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht/qhr-profile-calendar:123
crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht/qhr-profile-teach-hub:123
crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht/qhr-profile-showmasterpiece:123
```
