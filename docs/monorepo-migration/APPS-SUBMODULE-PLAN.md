# Web / Mobile / Desktop 目录拆分 + Submodule 迁移计划

> **状态**：已确认，待执行  
> **日期**：2026-09-02（修订）  
> **确认结论**：见 §0  
> **参照模式**：[`deploy/games/`](../../deploy/games/README.md)、[`deploy/wordpress/`](../../deploy/wordpress/README.md)

## 0. 已确认事项

| # | 结论 |
|---|------|
| 1 | 顶层：`apps/` **改名为 `web/`**；RN → **`mobile/`**；桌面 → **`desktop/`** |
| 2 | 执行顺序：**先移动端，再桌面端** |
| 3 | 子仓命名：`qxdqhr/profile-v1-*`（与 games 一致） |
| 4 | 新增顶层 **`npm/`** 放置 `*-shared` 包（供 mobile/desktop 消费；不强制先发公共 npm registry） |
| 5 | **Next 子应用暂不外迁**（calendar / teach-hub / showmasterpiece / node-notes / money-research 仍留在 `web/`） |

games / WordPress 旁路 **不动**。

---

## 1. 目标目录结构

```
profile-v1/
├── web/                          # 原 apps/（仅 Next.js Web 矩阵）
│   ├── web/                      # 主站 @profile/web (:3000)
│   ├── calendar/                 # :3001
│   ├── teach-hub/                # :3002
│   ├── showmasterpiece/          # :3003
│   ├── money-research/           # :3004（暂留，本计划不迁 submodule）
│   └── node-notes/               # :3005
├── mobile/                       # RN 客户端（git submodule）
│   ├── calendar-mobile/          # → qxdqhr/profile-v1-calendar-mobile
│   └── teach-hub-mobile/         # → qxdqhr/profile-v1-teach-hub-mobile
├── desktop/                      # 桌面端（git submodule）
│   └── teach-hub-desktop/        # → qxdqhr/profile-v1-teach-hub-desktop
├── npm/                          # 跨端共享包（父仓内，pnpm workspace）
│   ├── calendar-shared/          # 原 packages/calendar-shared
│   └── teach-hub-shared/         # 原 packages/teach-hub-shared
├── packages/                     # 仍保留 auth/db/config/ui/*-core 等
├── games/                        # 旁路 submodule（不动）
├── wordpress/                    # 旁路 submodule（不动）
└── deploy/                       # 网关 / 旁路基建
```

### 与现状对照

| 现状 | 目标 |
|------|------|
| `apps/web` | `web/web` |
| `apps/calendar` 等 Next | `web/calendar` 等 |
| `apps/calendar-mobile` | `mobile/calendar-mobile`（submodule） |
| `apps/teach-hub-mobile` | `mobile/teach-hub-mobile`（submodule） |
| `apps/teach-hub-desktop` | `desktop/teach-hub-desktop`（submodule） |
| `packages/calendar-shared` | `npm/calendar-shared` |
| `packages/teach-hub-shared` | `npm/teach-hub-shared` |
| `packages/*-core`、auth、db… | **仍在 `packages/`** |

---

## 2. Workspace 与依赖约定

### `pnpm-workspace.yaml`（目标）

```yaml
packages:
  - 'web/*'
  - 'packages/*'
  - 'npm/*'
  # mobile/*、desktop/* 为 submodule，默认不进 workspace
```

### `npm/` 包约定

| 包 | 包名 | 消费者 |
|----|------|--------|
| `npm/calendar-shared` | `@profile/calendar-shared` | `mobile/calendar-mobile`、可选 `web/calendar` |
| `npm/teach-hub-shared` | `@profile/teach-hub-shared` | `mobile/teach-hub-mobile`、`desktop/teach-hub-desktop`、可选 `web/teach-hub` |

- **父仓开发**：workspace `workspace:*` 链接 `npm/*`。
- **子仓（mobile/desktop）**：通过 `file:../../npm/<pkg>`（clone 含父仓时）或日后发 registry；本阶段优先 **父仓 monorepo 内 path / workspace**，子仓独立 clone 时再决定 registry。
- **不迁入 `npm/`**：`*-core`、`auth`、`db`、`config`、`ui`（仍只给 Web 矩阵用）。

---

## 3. 分层与范围

### 留在 `web/`（不外迁为 submodule）

| 应用 | 原因 |
|------|------|
| `web/web` | Auth / 实验田 / DB 聚合 |
| `web/calendar` 等 Next 子应用 | `@profile/auth`、`@profile/db`、`*-core` 强耦合 |
| `web/money-research` | 本计划暂不迁；后续可另开旁路计划 |

### 迁出为 submodule

| 阶段 | 路径 | 子仓名 | 类型 |
|------|------|--------|------|
| **1（先）** | `mobile/calendar-mobile` | `profile-v1-calendar-mobile` | Expo RN |
| **1（先）** | `mobile/teach-hub-mobile` | `profile-v1-teach-hub-mobile` | Expo RN |
| **2（后）** | `desktop/teach-hub-desktop` | `profile-v1-teach-hub-desktop` | Electron |

---

## 4. 分阶段任务

### 阶段 0 — 父仓目录重排（无 submodule，可独立 PR）

> 先改路径，再迁仓，降低一次 PR 爆炸面。

| 步骤 | 动作 |
|------|------|
| 0.1 | 新建 `npm/`，`git mv packages/calendar-shared`、`packages/teach-hub-shared` → `npm/` |
| 0.2 | `git mv apps` → `web`（整目录改名） |
| 0.3 | 更新 `pnpm-workspace.yaml`：`apps/*` → `web/*`，并加入 `npm/*` |
| 0.4 | 全仓替换路径引用：`apps/` → `web/`、`packages/*-shared` → `npm/*-shared`（Dockerfile、scripts、CI、README、KNOWLEDGE_BASE、AGENTS、`.cursor/rules`） |
| 0.5 | `pnpm install` + 抽样 `pnpm build:web` / `dev:calendar-mobile` 冒烟 |
| 0.6 | 更新 [`apps/README.md`](../../apps/README.md) → 迁为 `web/README.md`；索引写入 `docs/README.md` |

**预估**：0.5–1 天。风险：大量路径字符串，依赖全仓 grep 与 CI 绿。

### 阶段 1 — 移动端 submodule（优先）

**前置**：阶段 0 完成；APK 签名 Secrets 仍可用。

| 步骤 | 动作 |
|------|------|
| 1.1 | GitHub 建仓 `qxdqhr/profile-v1-calendar-mobile`、`profile-v1-teach-hub-mobile` |
| 1.2 | `git subtree split`（或 filter-repo）导出 `web/calendar-mobile`、`web/teach-hub-mobile` 历史 → 推送子仓 |
| 1.3 | 父仓删除对应目录，`git submodule add` → `mobile/calendar-mobile`、`mobile/teach-hub-mobile` |
| 1.4 | 子仓 `package.json`：依赖 `@profile/calendar-shared` / `teach-hub-shared` 指向父仓 `npm/`（文档写明需在 monorepo 根开发）或 `file:` 协议 |
| 1.5 | 迁移 CI：`calendar-mobile-release.yml`、`teach-hub-mobile-release.yml` → 子仓；父仓 workflow 改为 path filter `mobile/**` 或 dispatch |
| 1.6 | 更新根 `package.json` 脚本路径、`scripts/*-docker-package.sh` 中 Android 段、`docker-build-push.yml` APK path |
| 1.7 | 冒烟：本地 Expo / APK 构建；`git submodule update --init` 克隆流程 |

**预估**：2–4 天。

### 阶段 2 — 桌面端 submodule

| 步骤 | 动作 |
|------|------|
| 2.1 | 建仓 `qxdqhr/profile-v1-teach-hub-desktop` |
| 2.2 | 导出 `web/teach-hub-desktop` → 子仓；父仓 `desktop/teach-hub-desktop` submodule |
| 2.3 | 依赖 `npm/teach-hub-shared`；根脚本 `dev:teach-hub-desktop` 改路径或改为文档指引 |
| 2.4 | （可选）子仓加 electron-builder CI |

**预估**：1–2 天。无网关变更。

### 阶段 3 — 规则与文档收尾

- [ ] 更新 `.cursor/rules/profile-v1-submodules.mdc`：增加 `mobile/`、`desktop/`、`npm/`
- [ ] 更新 `KNOWLEDGE_BASE.md` §7、`docs/AGENTS.md`、根 `README.md`
- [ ] 编写 `deploy/mobile/ADD-MOBILE.md`、`deploy/desktop/ADD-DESKTOP.md`（仿 ADD-GAME）
- [ ] 本计划标记为「已执行」并链到变更 commit

---

## 5. CI / 部署影响摘要

| 组件 | 变更 |
|------|------|
| Docker 镜像（Next） | 构建上下文 `apps/` → `web/`；matrix 不变 |
| 网关 nginx / compose | URL 不变；仅 Dockerfile COPY 路径 |
| APK workflows | 迁入 `mobile/*` 子仓或 path 改 `mobile/**` |
| `build:all` | filter 包名不变；turbo 根路径随 workspace 更新 |
| games / wordpress | **无变更** |

---

## 6. 风险与回滚

| 风险 | 缓解 |
|------|------|
| `apps` → `web` 漏改路径导致 CI 红 | 阶段 0 单独 PR；全仓 `rg 'apps/'` 清单清零（排除 docs 历史叙述与旁路说明） |
| `web/web` 路径易混淆 | 文档与脚本一律写全路径；Cursor 规则注明「主站 = `web/web`」 |
| submodule 内找不到 `npm/*` | 约定：**日常开发在父仓根** `pnpm --filter @profile/calendar-mobile`；独立子仓 clone 时用 `file:` 或后续 registry |
| APK 签名 Secrets 断链 | Secrets 留在父仓或同步到子仓；阶段 1 完成前跑通一次 release dry-run |

**回滚**：按阶段 revert 父仓 PR；submodule 可先保留指针再删。

---

## 7. 明确不做（本计划）

- ❌ 将 calendar / teach-hub / showmasterpiece / node-notes / money-research 拆成独立 submodule
- ❌ 改动 `games/`、`wordpress/`、`deploy/games`、`deploy/wordpress`
- ❌ 把 `*-core` 挪进 `npm/`（core 仍属 Web 领域包）

---

## 8. 执行入口（阶段 0 预览）

确认本修订后，建议第一条执行序列：

```bash
# 阶段 0.1–0.2（示意）
mkdir -p npm
git mv packages/calendar-shared npm/calendar-shared
git mv packages/teach-hub-shared npm/teach-hub-shared
git mv apps web
# 随后改 pnpm-workspace.yaml + 全仓路径引用 + pnpm install 冒烟
```

**下一句指令**：回复「开始执行阶段 0」或「开始执行阶段 0+1」即可开工。
