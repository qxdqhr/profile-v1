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

## 手动 fix workflows

| 保留 | 说明 |
|------|------|
| `gateway-fix.yml` | 诊断 + 修网桥/重启（含 health / derive-db / deploy 脚本同步） |
| `remote-fix-now.yml` | 仅 nginx + env |

已删：`gateway-fix-only.yml`（与 `gateway-fix` 重复）。
