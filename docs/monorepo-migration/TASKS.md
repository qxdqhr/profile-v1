# Monorepo 迁移任务总表

> 状态：`pending` | `in_progress` | `done` | `blocked`  
> 子任务详情见 [subtasks/](./subtasks/)  
> 总计划：[README.md](./README.md) | 架构：[ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Phase 0 — 规划与脚手架

| ID | 任务 | 子任务 | 状态 | 依赖 |
|----|------|--------|------|------|
| M-00 | 迁移计划与架构文档 | README + ARCHITECTURE + TASKS | done | — |
| M-01 | pnpm workspace 根脚手架 | [ST-01](./subtasks/ST-01-workspace-scaffold.md) | done | M-00 |
| M-02 | Turborepo 与根脚本约定 | [ST-02](./subtasks/ST-02-turborepo-scripts.md) | done | M-01 |
| M-03 | packages/config 抽取 | [ST-03](./subtasks/ST-03-package-config.md) | done | M-01 |
| M-04 | packages/auth 抽取 | [ST-04](./subtasks/ST-04-package-auth.md) | done | M-03 |
| M-05 | packages/db 抽取 | [ST-05](./subtasks/ST-05-package-db.md) | done | M-03 |
| M-06 | packages/ui 与 Tailwind 共享 | [ST-06](./subtasks/ST-06-package-ui.md) | done | M-01 |

**里程碑 M0**：`pnpm install` 在 workspace 根成功；`packages/*` 基础包可被引用。✅

---

## Phase 1 — 主站 apps/web 搬迁

| ID | 任务 | 子任务 | 状态 | 依赖 |
|----|------|--------|------|------|
| M-07 | 创建 apps/web 并搬迁现有 Next 应用 | [ST-07](./subtasks/ST-07-app-web-migration.md) | done | M-02～M-06 |
| M-08 | 根目录 scripts / drizzle / CI 适配 web | [ST-08](./subtasks/ST-08-root-scripts-ci-web.md) | done | M-07 |

**里程碑 M1**：`pnpm --filter @profile/web build` 绿；生产部署暂仍单镜像（仅 web）。

---

## Phase 2 — calendar 子应用

| ID | 任务 | 子任务 | 状态 | 依赖 |
|----|------|--------|------|------|
| M-09 | packages/calendar-core 搬迁 | [ST-09](./subtasks/ST-09-calendar-core.md) | done | M-05, M-07 |
| M-10 | apps/calendar 脚手架与页面 | [ST-10](./subtasks/ST-10-app-calendar.md) | done | M-09, M-04 |
| M-11 | calendar API 与 DB 联通 | [ST-11](./subtasks/ST-11-calendar-api.md) | done | M-10 |
| M-12 | 入口切换与 web 旧路径兼容 | [ST-12](./subtasks/ST-12-calendar-cutover.md) | done | M-11 |

**里程碑 M2**：calendar 独立 `pnpm build`；`/testField/calendar` 或 `/calendar` 可访问；web 中旧模块标记 deprecated。

---

## Phase 3 — teach-hub 子应用

| ID | 任务 | 子任务 | 状态 | 依赖 |
|----|------|--------|------|------|
| M-13 | packages/teach-hub-core 搬迁 | [ST-13](./subtasks/ST-13-teach-hub-core.md) | done | M-05, M-07 |
| M-14 | apps/teach-hub 脚手架与路由 | [ST-14](./subtasks/ST-14-app-teach-hub.md) | done | M-13, M-04 |
| M-15 | teach-hub API / OSS / AI 任务注册 | [ST-15](./subtasks/ST-15-teach-hub-api-ai.md) | done | M-14 |
| M-16 | 入口切换与链接/路径环境变量 | [ST-16](./subtasks/ST-16-teach-hub-cutover.md) | done | M-15 |

**里程碑 M3**：teach-hub 独立 build；AI 生成课时端到端；web 不再 `registerTeachHubAiTasks`。

---

## Phase 4 — 多应用 CI / 部署（B 完成，面向 C）

| ID | 任务 | 子任务 | 状态 | 依赖 |
|----|------|--------|------|------|
| M-17 | 多 Dockerfile 与 GitHub Actions matrix | [ST-17](./subtasks/ST-17-multi-docker-ci.md) | done | M-12, M-16 |
| M-18 | 网关 / 反代与路径或子域路由 | [ST-18](./subtasks/ST-18-gateway-routing.md) | done | M-17 |
| M-19 | 删除 web 内废弃 modules 与 API 转发层 | [ST-19](./subtasks/ST-19-cleanup-legacy.md) | done | M-18 |
| M-20 | 方案 C 预备（独立域名、trustedOrigins、文档） | [ST-20](./subtasks/ST-20-phase-c-readiness.md) | done | M-19 |

**里程碑 M4**：三应用可独立发版；profile 单体 Docker 退役或仅保留 web。✅ **方案 B 已完成**

---

## 依赖总图

```
M-00
  └─ M-01 → M-02
        ├─ M-03 → M-04
        ├─ M-03 → M-05
        └─ M-06
              └─ M-07 → M-08
                    ├─ M-09 → M-10 → M-11 → M-12 ─┐
                    └─ M-13 → M-14 → M-15 → M-16 ─┼─ M-17 → M-18 → M-19 → M-20
```

## 当前冲刺建议

**方案 B 已完成**（M-01～M-20）。后续按 [PHASE-C-CHECKLIST.md](./PHASE-C-CHECKLIST.md) 触发条件启动方案 C。

## 勾选记录

- [x] 2026-06-11 M-10 `apps/calendar`
- [x] 2026-06-11 M-11 calendar API

## 勾选记录

- [x] 2026-06-11 M-09 `@profile/calendar-core`

## 勾选记录

- [x] 2026-06-11 M-07 apps/web 搬迁
- [x] 2026-06-11 M-08 Docker / 根脚本适配
- [x] 2026-06-17 M-15 teach-hub API / AI 单点注册
- [x] 2026-06-17 M-14 `apps/teach-hub`
- [x] 2026-06-17 M-13 `@profile/teach-hub-core`
- [x] 2026-06-11 M-12 calendar 切换
- [x] 2026-06-17 M-18 网关 nginx + compose 部署
- [x] 2026-06-17 M-19 web 遗留清理
- [x] 2026-06-17 M-20 方案 C 预备文档
