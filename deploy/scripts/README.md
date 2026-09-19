# deploy/scripts/ — 仓库工具脚本（原根目录 `scripts/`）

在本机 / CI runner 上执行；**不**随网关 scp 整包到服务器（例外：`godot/compress-godot-www.sh` 会单独拷到服务器根，供现网补 `.gz`）。

现网部署脚本见上级 [`gateway/`](../gateway/)、[`holt/`](../holt/)、[`ops/`](../ops/)。

## 子目录

| 目录 | 用途 |
|------|------|
| `ci/` | 镜像 promote / base mirror、飞书通知、Docker 内建 sa2kit |
| `godot/` | Godot Web 导出、预压 gzip、共用引擎、prebuilt 同步 |
| `gate/` | 架构/UI 门禁、`verify-*` 测试、postinstall 确保 dist |
| `db/` | drizzle push、auth enum、测试账号、节日贺卡迁移 |
| `config/` | SOPS / age 加解密、config doctor、preload |
| `docker/` | 各子应用本地 `package:*-docker-package` |
| `native/` | mobile/desktop workspace 开关、Android 签名 |
| `tools/` | 零散工具（AI 试连、skill-manager 校验、file API smoke） |

## 常用入口（根 `package.json`）

| 命令 | 脚本 |
|------|------|
| `pnpm gate` | `gate/check-*-gate.mjs` + `gate/verify-*.ts` |
| `pnpm build:libs` / `postinstall` | `gate/ensure-sa2kit-workspace-dist.mjs` |
| `pnpm config:decrypt-production` | `config/config-decrypt-production.sh` |
| `pnpm package:calendar` 等 | `docker/*-docker-package.sh` |
| Godot 导出 | `bash deploy/scripts/godot/export-godot-game.sh <slug>` |

## 已删除的一次性脚本

历史迁移 / 调试用，已无引用后删除：

- `migrate-users-to-user.ts`、`migrate-sa2kit-imports.mjs`
- `ensure-orphan-user-records.ts`、`query-calendar-events.ts`
- `sync-business-config.ts`、`sync-local-business-to-production-plain.ts`、`sync-oss-from-prod-db.ts`
- `smoke-showmasterpiece.sh`、`teach-hub-file-debug.ts`
- `export-pulse-parade-web.sh`（由通用 `export-godot-game.sh` 取代）
- `send-ci-feishu-notify.ts`（保留 `.mjs`）
