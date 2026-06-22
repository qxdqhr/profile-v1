# profile-v1 → Monorepo 子应用迁移（方案 B）

> **目标**：将 **calendar**、**teachHub**、**showmasterpiece** 等从单体 `profile-v1` 拆为可独立构建、可独立部署的 Next 应用，并为 **方案 C**（完全脱离 profile、独立域名/独立运维）预留路径。  
> **当前阶段**：方案 B — pnpm workspace + 多 `apps/*` + 共享 `packages/*`，仍可与主站同仓、同库、同 Auth。Calendar / TeachHub 已有 Expo RN 客户端。

## 文档索引

| 文档 | 说明 |
|------|------|
| [TASKS.md](./TASKS.md) | 任务总表、阶段里程碑、依赖关系 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 目标目录、边界、部署与 B→C 演进 |
| [deploy.md](./deploy.md) | 三应用 Docker 镜像、端口、CI tag |
| [PHASE-C-CHECKLIST.md](./PHASE-C-CHECKLIST.md) | B→C 演进检查清单（ST-20） |
| [subtasks/](./subtasks/) | 子任务 ST-01～ST-20 详细说明 |

## 背景与动机

| 痛点（单体） | 方案 B 如何解决 |
|--------------|-----------------|
| `pnpm install` / `next build` 全量，无关模块（AR/aframe 等）拖慢 CI | 各 app 独立 `package.json`，按需安装与构建 |
| `src/modules/*` 边界靠约定，易被跨模块 deep import | 物理目录隔离 + `packages/*` 显式依赖 |
| calendar / teachHub 与 profile 同发版 | 各 app 独立镜像与 workflow（阶段 4） |
| 预渲染 examples 等拖垮生产构建 | 子应用 build 不包含无关路由 |

## 目标形态（Phase 4 结束时）

```
profile-v1/                          # 仓库根（可日后改名为 profile-platform）
├── pnpm-workspace.yaml
├── turbo.json
├── apps/
│   ├── web/                         # 原 profile 主站（个人页、实验田等）
│   ├── calendar/                    # 日历子应用
│   ├── calendar-mobile/             # 日历 RN（Expo）
│   ├── teach-hub/                   # teachHub 子应用
│   ├── teach-hub-mobile/            # teachHub RN
│   ├── teach-hub-desktop/           # teachHub Electron 脚手架
│   └── showmasterpiece/             # ShowMasterpiece 画集子应用
├── packages/
│   ├── config/                      # app.config 加载、env 约定
│   ├── auth/                        # better-auth 客户端 + React 壳
│   ├── db/                          # Drizzle schema、migrate、db client
│   ├── ui/                          # 共享 Tailwind / 基础组件（按需）
│   ├── calendar-core/               # 日历领域逻辑
│   ├── calendar-shared/             # 日历 RN 共享类型与 API 客户端
│   ├── teach-hub-core/              # teachHub 领域逻辑
│   ├── teach-hub-shared/            # teachHub RN 共享
│   └── showmasterpiece-core/        # ShowMasterpiece 全量业务
├── drizzle/                         # 迁移文件（短期仍集中，长期可按 package 拆分）
└── docs/monorepo-migration/         # 本计划
```

## 路由与 URL 策略（渐进）

| 阶段 | calendar | teachHub | showmasterpiece | 主站 |
|------|----------|----------|-----------------|------|
| 过渡期 | `/testField/calendar` 反代或保留 | `/testField/teachHub` | `/testField/ShowMasterPieces` | 不变 |
| B 稳定期 | `/calendar` | `/teach-hub` | `/showmasterpiece` | `qhr062.top` |
| C 终态 | 独立域名 + 独立仓库可选 | 独立域名 + 独立仓库可选 | 独立域名可选 | profile 核心 |

## 原则

1. **绞杀者模式**：先复制/搬迁，再切换入口，最后删除 `src/modules/calendar|teachHub`。
2. **共享优先**：Auth、DB、OSS、sa2kit 配置在 `packages/*` 统一，避免 B 阶段就拆成三个数据库。
3. **API 契约稳定**：对外路径保持 `/api/calendar/*`、`/api/teach-hub/*`、`/api/showmasterpiece/*`，由网关反代至各 app 自承载 API。
4. **先 calendar 后 teachHub 后 showmasterpiece**：showmasterpiece 与 OSS、画集 DB 耦合；teachHub 与 `aiApi` 服务端注册耦合更深。
5. **每完成一 ST 更新 [TASKS.md](./TASKS.md)** 勾选与状态。

## 子任务速览

见 [TASKS.md](./TASKS.md)。建议执行顺序：

```
ST-01 → ST-02 → ST-03 + ST-04（并行）→ ST-05 → ST-06
  → ST-07（web 搬迁）→ ST-08～ST-12（calendar）→ ST-13～ST-17（teach-hub）
  → ST-18～ST-20（多镜像 CI / 反代 / B→C 预备）
```

## 不在本计划范围（方案 C backlog）

- 独立 Git 仓库与跨仓版本发布
- 微前端 iframe / Module Federation
- 独立用户体系（仍共用 better-auth + 同一 `user` 表）

## 相关现有文档

- 知识库：`.cursor/KNOWLEDGE_BASE.md`
- teach-hub 领域文档：`packages/teach-hub-core/docs/`
- calendar 领域文档：`packages/calendar-core/README.md`
