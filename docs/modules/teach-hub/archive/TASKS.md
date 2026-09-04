# teachHub 任务总表

> 状态：`pending` | `in_progress` | `done` | `blocked`  
> 子任务详情见 [subtasks/](./subtasks/)

## Phase 1 — 工作区骨架 + 手动学习

| ID | 任务 | 子任务文档 | 状态 | 依赖 |
|----|------|-----------|------|------|
| T-01 | 模块目录与文档脚手架 | [ST-01](./subtasks/ST-01-module-scaffold.md) | done | — |
| T-02 | 数据库 schema 与迁移 | [ST-02](./subtasks/ST-02-database-schema.md) | done | T-01 |
| T-03 | OSS 文件层 | [ST-03](./subtasks/ST-03-oss-file-layer.md) | done | T-01 |
| T-04 | REST API 路由 | [ST-04](./subtasks/ST-04-api-routes.md) | done | T-02, T-03 |
| T-05 | 工作区仪表盘 UI | [ST-05](./subtasks/ST-05-workspace-ui.md) | done | T-04 |
| T-06 | 课时 iframe 播放器 | [ST-06](./subtasks/ST-06-lesson-viewer.md) | done | T-04 |
| T-07 | 进度追踪 | [ST-07](./subtasks/ST-07-progress-tracking.md) | done | T-04, T-06 |
| T-08 | Mission 编辑器 | [ST-08](./subtasks/ST-08-mission-editor.md) | done | T-04, T-05 |
| T-11 | 实验田注册与构建验证 | [ST-11](./subtasks/ST-11-experiment-register.md) | done | T-05 |

### Phase 1 里程碑

- **M1.1** T-01～T-04 完成：API 可创建空工作区并上传 zip
- **M1.2** T-05～T-08 完成：用户可图形化学习 `musicStudy` 样例
- **M1.3** T-11 完成：实验田入口 + `pnpm run build` 绿

---

## Phase 2 — Mimo 用户触发备课

| ID | 任务 | 子任务文档 | 状态 | 依赖 |
|----|------|-----------|------|------|
| T-09 | Teach Agent 任务 | [ST-09](./subtasks/ST-09-teach-agent.md) | done | T-03, T-04 |
| T-10 | 生成第一课 / 下一课流程 | [ST-10](./subtasks/ST-10-generate-lesson-flow.md) | done | T-07, T-08, T-09 |

### Phase 2 里程碑

- **M2.1** 用户填 Mission → 生成 `lessons/0001-*.html`
- **M2.2** 完成 0001 → 生成 `lessons/0002-*.html` + learning-record

---

## Phase 3 — 体验增强（ backlog ）

| ID | 任务 | 说明 | 状态 |
|----|------|------|------|
| T-12 | postMessage 测验桥 | iframe 自动记 quiz 分 | pending |
| T-13 | 间隔重复 | `nextReviewAt` 复习队列 | pending |
| T-14 | zip 导出 | 下载完整工作区 | pending |
| T-15 | starter 模板 fork | 公共模板复制到用户工作区 | pending |
| T-16 | 课内答疑 | `teach.answerQuestion` | pending |

---

## 当前冲刺建议顺序

```
T-01 → T-02 + T-03（可并行）→ T-04 → T-05 → T-06 → T-07 → T-08 → T-11
                                                              ↓
                                                    Phase 2: T-09 → T-10
```

## 勾选记录

- [x] 2026-06-15 T-01 文档与目录脚手架
- [x] 2026-06-15 T-02 数据库 schema + devdb:push
- [x] 2026-06-15 T-03 OSS 文件层 teachHubFileStore
- [x] 2026-06-15 T-04 REST API 路由 + teachHubClient
- [x] 2026-06-15 T-05～T-08、T-11 UI + 实验田 + build
- [x] 2026-06-15 Phase 2: T-09 Teach Agent + T-10 生成流程
