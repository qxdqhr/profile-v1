# deploy/ — 生产网关与旁路

本目录是 **profile-v1 现网部署的落盘面**：CI / 手工运维把这里的 compose、nginx、脚本同步到服务器 `/root/profile-v1/`，再执行部署或修复。

业务源码不在这里（Web 在 `app_web/`，游戏源码在 `app_games/`，Holt 主题在 `app_wordpress/`）。

更细的现网步骤见 [`MIGRATION-RUNBOOK.md`](./MIGRATION-RUNBOOK.md)；CI 约定见 [`docs/infrastructure/ops-ci.md`](../docs/infrastructure/ops-ci.md)。

## 目录结构

```
deploy/
├── README.md                 ← 本文件
├── MIGRATION-RUNBOOK.md      ← 现网迁移 / 回滚 Runbook
├── docker-compose.gateway.yml
├── .env.example
├── gateway/                  ← 网关部署主路径脚本（跑在服务器）
├── holt/                     ← Holt WordPress 内容运维
├── ops/                      ← 偶发诊断 / 修复
├── scripts/                  ← 本机/CI 工具（原根目录 scripts/）
├── nginx/                    ← 平台反代 + 外层 TLS 参考配置
├── games/                    ← Godot 静态产物占位 + 文档
└── wordpress/                ← WP 旁路本地 compose + 教程（非 submodule）
```

服务器上对应关系：

| 仓库 | 服务器 |
|------|--------|
| `deploy/docker-compose.gateway.yml` | `/root/profile-v1/docker-compose.gateway.yml` |
| `deploy/nginx/*` | `/root/profile-v1/nginx/` |
| `deploy/gateway/*.sh` | `/root/profile-v1/gateway/` |
| `deploy/holt/*.sh` | `/root/profile-v1/holt/` |
| `deploy/ops/*.sh` | `/root/profile-v1/ops/` |
| `deploy/games/<slug>/www/` | `/root/profile-v1/games/<slug>/www/` |

`gateway/*.sh` 通过 `_lib.sh` 把 `DEPLOY_DIR` 解析为**上一级**（compose / nginx / games 所在根）。

---

## 根目录文件

| 文件 | 用途 |
|------|------|
| `docker-compose.gateway.yml` | 生产栈：nginx + 各 Next 子应用 + MariaDB/WordPress |
| `.env.example` | 服务器 `.env` 键说明（真实密钥不进 git） |
| `MIGRATION-RUNBOOK.md` | 单容器 → 网关迁移、回滚、探活手册 |

---

## `gateway/` — 日常部署主路径

CI `deploy-web` 的核心链路：

`gateway/deploy-profile-v1.sh` →（可选）`gateway/fix-gateway-remote.sh`

| 脚本 | 用途 |
|------|------|
| `_lib.sh` | 公共：解析 `GATEWAY_DIR` / `DEPLOY_DIR` |
| `deploy-profile-v1.sh` | **主部署**：写 `.env`、保证 nginx 镜像、compose down/up、补 WP DB、等就绪、补 Godot `.gz`、reload nginx、冒烟 |
| `fix-gateway-remote.sh` | **部署后修复**：Postgres 网桥、重写 `DATABASE_URL`、schema 幂等、审计外层 nginx；`POST_DEPLOY=1` 时跳过重复冒烟 |
| `ensure-nginx-image.sh` | 确保本机有 `${REGISTRY}/library-nginx`（拆栈前必须成功） |
| `ensure-database-url.sh` | 从 `app.config.yaml` 推导并校验 `DATABASE_URL`（端口必须 5432） |
| `derive-database-url.sh` | 纯推导：读 yaml → 打印 URL（被 ensure 调用） |
| `ensure-wordpress-env.sh` | 补全 `.env` 里 WP/MariaDB 非密钥键；弱口令则失败 |
| `ensure-wordpress-database.sh` | 在 MariaDB 里幂等创建 WP 库/用户 |
| `ensure-calendar-schema.sh` | 幂等补 calendar 相关表 |
| `ensure-node-notes-schema.sh` | 幂等补 node-notes 相关表 |
| `wait-gateway-ready.sh` | 轮询网关端口直到可访问 |
| `smoke-test-gateway.sh` | 部署后 HTTP 冒烟（含 `/games`、共享引擎、Holt） |
| `check-gateway-health.sh` | 轻量健康诊断（auth / calendar API 等） |
| `audit-outer-nginx.sh` | 审计宿主机外层 TLS nginx 是否正确传 `X-Forwarded-Proto` |
| `cleanup-server-disk.sh` | 磁盘紧张时 prune Docker 镜像/构建缓存（尽量保留 nginx） |

---

## `holt/` — Holt WordPress 内容

由独立 GitHub Actions（`workflow_dispatch`）触发，不进主部署。

| 脚本 | 用途 |
|------|------|
| `import-holt-bilibili-works.sh` | 用 `holt-bilibili-works.json` 导入/替换 `work` CPT |
| `sync-holt-work-meta-covers.sh` | 回填 meta，并分批补封面（`LIMIT` / `OFFSET`） |
| `reset-wordpress-holt-password.sh` | 重置 `wordpress_holt` 首个 administrator 密码（需 `NEW_PASSWORD`） |

JSON 默认路径：`wordpress/holt/data/holt-bilibili-works.json`（本地也可落在 `app_wordpress/holt/data/`）。

---

## `ops/` — 偶发运维

| 脚本 | 用途 |
|------|------|
| `check-server-resources.sh` | 磁盘 / 内存 / Docker 占用快照 |
| `remote-fix-nginx-env.sh` | 一次性修复：用 app.config 重写 `DATABASE_URL`、内层 https 重定向、外层 `proxy_redirect`；优先用 `gateway-fix` workflow |

已删除：`hotfix-calendar-api-nginx.sh`（内嵌过时残缺 nginx，零引用且危险）。

---

## `nginx/`

| 文件 | 用途 |
|------|------|
| `profile-platform.conf` | **平台 nginx**（容器内）：子应用反代 + `/games` + `/wp/holt` |
| `proxy-params.conf` | 平台反代公共 header（含 `X-Forwarded-Proto`） |
| `outer-ubuntu-qhr062.conf` | **宿主机** TLS 终止参考配置（`/games/` 关 gzip/buffering） |
| `proxy-params-outer.conf` | 外层反代公共 header |

---

## `games/`

| 路径 | 用途 |
|------|------|
| `<slug>/www/` | Godot Web 产物占位（CI 导出写入；**不进 git**） |
| `godot-engine/www/` | 全站共用引擎 wasm/js |
| `README.md` / `ADD-GAME.md` | 旁路架构与加游戏规程 |
| `GODOT-REWRITE-PLAN.md` | Phaser → Godot 双轨迁移账本 |

导出与共用引擎：`deploy/scripts/godot/export-godot-game.sh`、`share-godot-engine-www.sh`、`compress-godot-www.sh`。

---

## `scripts/` — 本机 / CI 工具（原根目录 `scripts/`）

索引见 [`scripts/README.md`](./scripts/README.md)。按职责分子目录：`ci/`、`godot/`、`gate/`、`db/`、`config/`、`docker/`、`native/`、`tools/`。

**不**整目录 scp 到服务器；CI 仅单独拷贝 `godot/compress-godot-www.sh` 到服务器根供现网补 gzip。

---

## `wordpress/`

| 路径 | 用途 |
|------|------|
| `docker-compose.dev.yml` / `nginx-dev.conf` | **本地**只起 WP 旁路 |
| `ADD-SITE.md` / `README.md` / `DEVELOPMENT.md` | 加站与开发说明 |
| `php/` | WordPress 二开 / 上线教程 |

生产 WP 服务定义在根上的 `docker-compose.gateway.yml`（`wordpress_holt` + `wp_mariadb`）。

---

## 常用命令（服务器）

```bash
cd /root/profile-v1

# 完整部署（一般由 CI 调用）
REGISTRY=... IMAGE_TAG=... ./gateway/deploy-profile-v1.sh

# 部署后修复 + 冒烟跳过（CI POST_DEPLOY=1）
POST_DEPLOY=1 ./gateway/fix-gateway-remote.sh

# 仅健康检查
./gateway/check-gateway-health.sh
```

## 相关 GitHub Actions

| Workflow | 调用 |
|----------|------|
| `Build and Push Docker Images` | `gateway/deploy-profile-v1.sh` + `fix-gateway-remote.sh` |
| `Gateway Diagnose and Fix` | `gateway/fix-gateway-remote.sh` |
| `Remote Fix Nginx and Env` | `ops/remote-fix-nginx-env.sh` |
| `Cleanup Server Disk` | `gateway/cleanup-server-disk.sh` |
| `Check Server Resources` | `ops/check-server-resources.sh` |
| `Import / Sync / Reset Holt *` | `holt/*.sh` |
