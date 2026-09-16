# 运维与 CI 约定（OPT-07）

> 生产网关细节仍以 [`deploy/MIGRATION-RUNBOOK.md`](../../deploy/MIGRATION-RUNBOOK.md) 为准。

## nginx `depends_on`

平台 compose（`deploy/docker-compose.gateway.yml`）里 nginx **不用** `condition: service_healthy`。

原因：Next 冷启动慢，healthy 门闩会拖垮整栈 `up`；各 Next 服务与 nginx 自身仍有 `healthcheck`，用于观测与探活脚本，不阻塞依赖图。

## 镜像 tag

| 项 | 约定 |
|----|------|
| Tag | CI `github.run_number` → `qhr-profile-<app>:NNN` |
| 生产 | `deploy/.env` 的 `IMAGE_TAG=NNN` |
| 回滚 | 改 `IMAGE_TAG` → `compose pull <svc>` → `up -d <svc>`（见 Runbook） |
| 晋升脚本 | `scripts/ci-promote-docker-image.sh`（未变更 / 卫星构建失败回退） |
| 基础镜像 | CI `scripts/ci-mirror-base-images.sh` 把 `nginx` 推到 `${REGISTRY}/library-nginx:1.27-alpine`；服务器只从阿里云拉。`deploy/ensure-nginx-image.sh` 优先该 tag |

部署时阿里云业务镜像必拉成功；nginx **不再依赖** DaoCloud/Docker Hub（CI runner 负责 mirror）。禁止在 nginx 不可用时 `compose down`。

## CI 三轨隔离（`docker-build-push.yml`）

| 轨 | Job | 有变更才跑 | 失败策略 |
|----|------|------------|----------|
| **主站轨** | `build-web` + `promote-images`(web) + `deploy-web` | path filter | **阻断部署**；workflow 主结论失败 |
| **卫星轨** | `build-satellites`（calendar / teach-hub / …） | path filter | job 报错 + 飞书「部分失败」；**不阻断**主站部署；失败时 **fallback promote** 旧镜像到本次 `run_number`，避免 tag 空洞 |
| **旁路轨** | Mobile APK、`export-godot-games` | path filter | `continue-on-error`；失败不阻断部署；Games 失败则跳过 www 同步 |

要点：

1. **有变更才编译**：`dorny/paths-filter`；未变更 Docker 应用走 promote。
2. **统一 IMAGE_TAG**：成功构建或 promote / fallback 后，所有应用都有 `:NNN`。
3. **飞书状态**：`success` / `partial`（主站过、旁路或卫星挂）/ `failure`（web / promote / deploy 挂）。
4. **deploy 触发**：任一 Docker 子应用、deploy、games、wordpress 变更均可触发网关部署。

## Godot `/games` 与 CPU

平台 nginx 对 `index.wasm` / `index.pck` **只允许 `gzip_static`**，禁止现场 gzip。缺 `.gz` 时直出未压缩文件。外层 Ubuntu nginx 的 `/games/` 关闭 gzip 与 proxy buffering，避免 38MB 包打满 CPU 后整站 502。

标准 Godot 包共用 `/games/godot-engine/` 一份引擎（`scripts/share-godot-engine-www.sh`）；各游戏只下自己的 `.pck`。浏览器对引擎 URL 长缓存。

## 手动 fix workflows

| 保留 | 说明 |
|------|------|
| `gateway-fix.yml` | 诊断 + 修网桥/重启（含 health / derive-db / deploy 脚本同步） |
| `remote-fix-now.yml` | 仅 nginx + env |

已删：`gateway-fix-only.yml`（与 `gateway-fix` 重复）。
