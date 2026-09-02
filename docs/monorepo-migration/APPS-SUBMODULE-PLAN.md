# apps/ 非 Web 项目 → Submodule + 旁路迁移计划

> **状态**：草案，待确认后执行  
> **日期**：2026-09-02  
> **参照模式**：[`deploy/games/`](../deploy/games/README.md)（Godot submodule + nginx 旁路）、[`deploy/wordpress/`](../deploy/wordpress/README.md)（WP submodule + PHP 旁路）

## 1. 背景与目标

当前 `apps/` 混放 **主站 Web**、**Next 子应用**、**Expo RN**、**Electron**、**Python 混合 Demo**。  
games / WordPress 已证明：**重资产 / 独立技术栈** 用 **git submodule + 父仓 deploy 旁路** 可减 monorepo 体积、独立版本与 CI。

**目标**：

1. `apps/` 收敛为 **Next.js Web 矩阵**（主站 + 共享 Auth/DB 的子应用）。
2. **非 Web、弱 monorepo 耦合** 的项目迁出为 submodule。
3. 父仓保留：网关 nginx、compose、CI 触发、实验田/导航链接（整页跳转旁路 URL）。

**不在本次范围**：

- Next 子应用（calendar / teach-hub / showmasterpiece / node-notes）外迁 — 强依赖 `@profile/auth`、`@profile/db`、`*-core`。
- games / WordPress 已有 submodule 结构 — 不动。

---

## 2. 现状：`apps/` 清单

| 目录 | 类型 | `@profile/*` | 网关 / CI | 迁出难度 |
|------|------|--------------|-----------|----------|
| `web/` | Next 主站 | auth, db, config, ui, *-core | `:3000` / CI 核心 | **留** |
| `calendar/` | Next 子应用 | auth, db, calendar-core | `:3001` / Docker | **留** |
| `teach-hub/` | Next 子应用 | auth, db, teach-hub-core | `:3002` / Docker | **留** |
| `showmasterpiece/` | Next 子应用 | auth, db, showmasterpiece-core | `:3003` / Docker | **留** |
| `node-notes/` | Next 子应用 | auth, db, node-notes-core | `:3005` / Docker | **留** |
| `money-research/` | Next + Python demo | **无** workspace 包 | `:3004` / Docker | **低** |
| `calendar-mobile/` | Expo RN | 仅 calendar-shared | APK CI | **中** |
| `teach-hub-mobile/` | Expo RN | 仅 teach-hub-shared | APK CI | **中** |
| `teach-hub-desktop/` | Electron 脚手架 | 仅 teach-hub-shared | 无 CI | **低** |

迁出后 `apps/` 目标态：

```
apps/
├── web/
├── calendar/
├── teach-hub/
├── showmasterpiece/
└── node-notes/
```

旁路 / submodule 目标态（新增顶层目录，与 `games/`、`wordpress/` 并列）：

```
clients/                    # 或 mobile/、native/ — 待确认命名
├── calendar-mobile/        # git submodule
├── teach-hub-mobile/       # git submodule
└── teach-hub-desktop/      # git submodule

research/                   # 或 sidecars/ — 待确认命名
└── money-research/         # git submodule
```

> **命名备选**：`clients/`（多端客户端）、`native/`、`sidecars/`。确认阶段请选定一种，避免与 `packages/*-shared` 混淆。

---

## 3. 分层策略

### Tier A — 保留在 monorepo（5 个 Next）

**原因**：同域 session、`app.config.yaml`、Drizzle schema、`packages/*-core` 与 Dockerfile `COPY packages/` 强绑定。

| 应用 | 保留路径 |
|------|----------|
| 主站 | `apps/web` |
| Calendar Web | `apps/calendar` + `packages/calendar-core` |
| TeachHub Web | `apps/teach-hub` + `packages/teach-hub-core` |
| ShowMasterpiece | `apps/showmasterpiece` + `packages/showmasterpiece-core` |
| Node Notes | `apps/node-notes` + `packages/node-notes-core` |

### Tier B — 优先迁出（阶段 1）

#### B1. `money-research` → submodule + 旁路 Next

| 项 | 方案 |
|----|------|
| 子仓 | `profile-v1-research-money-research`（公开 GitHub） |
| 父仓路径 | `research/money-research/`（submodule） |
| 网关 | 保持 `/money-research/`、`/api/money-research/`（nginx 反代不变） |
| pnpm | 从 `pnpm-workspace.yaml` 移除；父仓 `package.json` 删 `dev:money-research` 等，改文档指向子仓 |
| CI | `docker-build-push.yml` 构建上下文改为 submodule；或子仓独立 workflow + 父仓 dispatch |
| 依赖 | 无 `@profile/*`；Python demo 自包含 |

**类比**：WordPress — 独立运行时栈，父仓只保留 deploy 与路由。

#### B2. `teach-hub-desktop` → submodule（无网关）

| 项 | 方案 |
|----|------|
| 子仓 | `profile-v1-client-teach-hub-desktop` |
| 父仓路径 | `clients/teach-hub-desktop/` |
| 网关 | 无（本地 Electron / 未来安装包分发） |
| CI | 可选：子仓 tag 触发 electron-builder |
| 依赖 | HTTP 调 teach-hub API；`@profile/teach-hub-shared` 需 npm 化或复制类型 |

**类比**：games 源码仓 — 不参与 pnpm workspace，父仓无 Docker 服务。

### Tier C — 阶段 2 迁出（RN 客户端）

#### C1. `calendar-mobile`、C2. `teach-hub-mobile`

| 项 | 方案 |
|----|------|
| 子仓 | `profile-v1-client-calendar-mobile`、`profile-v1-client-teach-hub-mobile` |
| 父仓路径 | `clients/calendar-mobile/`、`clients/teach-hub-mobile/` |
| 前置 | **`@profile/calendar-shared`、`@profile/teach-hub-shared` 发布 npm**（或 GitHub Packages），子仓 `pnpm add` 固定版本 |
| sa2kit-ui | 已用仓外 `link:`；改为 npm 版本或 submodule |
| CI | 现有 `calendar-mobile-v*` / teach-hub tag workflow 迁入子仓；父仓 workflow 改为 `workflow_dispatch` 或 path filter `clients/**` |
| 签名 | `config/android-signing.env` 可留父仓 secrets 文档，子仓 CI 读 GitHub Secrets |

**Web 子应用与 `*-core` 不迁出** — RN 仅 HTTP 消费 API。

---

## 4. 分阶段任务

### 阶段 0 — 准备（1 PR，无迁仓）

- [ ] 确认顶层目录名：`clients/` + `research/`（或用户指定）
- [ ] 编写 [`deploy/clients/ADD-CLIENT.md`](../deploy/clients/ADD-CLIENT.md)（仿 `ADD-GAME.md`）
- [ ] 更新 `.cursor/rules/profile-v1-submodules.mdc` 扩展 RN/Electron/research
- [ ] 更新 `KNOWLEDGE_BASE.md` §7、`apps/README.md`
- [ ] 发布 `@profile/calendar-shared`、`@profile/teach-hub-shared` v0.x 到 npm（阶段 2 前置，可并行）

### 阶段 1 — money-research + teach-hub-desktop

| 步骤 | 动作 |
|------|------|
| 1.1 | 在 GitHub 创建空仓，从 `apps/money-research` 导出历史（`git filter-repo` 或 subtree split） |
| 1.2 | `git submodule add … research/money-research`；删除 `apps/money-research` |
| 1.3 | 调整 `deploy/docker-compose.gateway.yml`、nginx、`scripts/money-research-docker-package.sh` 路径 |
| 1.4 | 更新 CI matrix、`build:all`、turbo filter |
| 1.5 | 对 teach-hub-desktop 重复 1.1–1.2（无 compose 变更） |
| 1.6 | 冒烟：网关 `/money-research`、本地 Electron dev |

**预估**：2–3 天，风险低。

### 阶段 2 — RN 双端

| 步骤 | 动作 |
|------|------|
| 2.1 | 发布 shared 包；子仓改依赖 |
| 2.2 | submodule 化 calendar-mobile、teach-hub-mobile |
| 2.3 | 迁移 APK workflow 与 `package:calendar` / `package:teach-hub` 中 Android 段 |
| 2.4 | 更新 `apps/README.md`、实验田说明（若有 RN 入口） |

**预估**：3–5 天，依赖 npm 发布与签名 secrets 迁移。

### 阶段 3 — 文档与清理

- [ ] `docs/monorepo-migration/` 归档本计划执行结果
- [ ] 删除父仓内 RN/Electron 残留脚本引用
- [ ] CI path filter：`clients/**`、`research/**` 类似 `GAMES_CHANGED`

---

## 5. 风险与回滚

| 风险 | 缓解 |
|------|------|
| CI 构建上下文找不到 `packages/` | money-research Dockerfile 已独立；迁出前在子仓验证 `docker build` |
| shared 包未发布导致 RN 子仓 build 失败 | 阶段 2 前必须 npm 发布；或临时 git submodule 引用 `packages/*-shared` |
| 开发者 clone 忘记 `--recurse-submodules` | 文档 + CI `submodules: recursive`（已有） |
| 父仓 `pnpm install` 变慢/报错 | 迁出后从 workspace 移除，根 install 只装 Web 矩阵 |

**回滚**：保留 submodule 指针上一版本 + 恢复 `apps/<name>` 目录（git revert 父仓 PR）。

---

## 6. 待你确认的事项

1. **顶层目录命名**：`clients/` + `research/` 是否 OK？或有更偏好的 `mobile/`、`sidecars/`？
2. **执行范围**：是否 **阶段 1 先做**（money-research + teach-hub-desktop），RN 放阶段 2？
3. **GitHub 组织**：子仓是否统一 `qxdqhr/profile-v1-*` 命名（与 games 一致）？
4. **shared 包发布**：是否接受阶段 2 前将 `calendar-shared` / `teach-hub-shared` 发布到 npm（@profile scope 或 @qhr123）？
5. **Next 子应用**：确认 **不外迁** calendar / teach-hub / showmasterpiece / node-notes？

---

## 7. 确认后第一条执行命令（阶段 1 预览）

```bash
# 示例：money-research（确认后由 Agent 执行）
git subtree split --prefix=apps/money-research -b split/money-research
# → 推送到新仓 → git submodule add → 删 apps/money-research → 改 deploy/CI
```

**请回复确认项 1–5，或调整范围后再开始执行。**
