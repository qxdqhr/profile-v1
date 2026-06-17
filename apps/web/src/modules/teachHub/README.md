# teachHub — 用户级 teach skill 学习工作区

## 定位

为每个登录用户提供独立的 **teach skill 工作区** 图形化封装：

- 用户自建、自管学习主题（多工作区并行）
- 工作区内容存 OSS（`MISSION.md`、`lessons/*.html` 等，与 teach skill 契约 1:1）
- 学习进度与元数据存 DB
- 用户学完一章后，主动触发 Mimo Teach Agent 备课下一章

**不是**全局课程 CMS，**不需要**管理员维护用户课程。

## 文档索引

| 文档 | 说明 |
|------|------|
| [teach-hub-plan.md](./teach-hub-plan.md) | 总开发计划、阶段、文件结构 |
| [docs/TASKS.md](./docs/TASKS.md) | 任务总表与阶段勾选 |
| [docs/DATA.md](./docs/DATA.md) | DB 表、OSS 路径、API 契约 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 架构与数据流 |
| [docs/subtasks/](./docs/subtasks/) | 子任务拆分（ST-01 … ST-11） |

## 路由（规划）

```
/testField/teachHub                          工作区仪表盘
/testField/teachHub/new                      新建工作区
/testField/teachHub/w/[workspaceId]          工作区主页
/testField/teachHub/w/[workspaceId]/mission   Mission 编辑
/testField/teachHub/w/[workspaceId]/lesson/[slug]   课时播放
/testField/teachHub/w/[workspaceId]/reference/[slug] 速查
/testField/teachHub/w/[workspaceId]/records   学习记录
/testField/teachHub/w/[workspaceId]/settings  导出 / 归档
```

## 依赖模块

- `@/lib/auth` — 用户鉴权，工作区归属校验
- `sa2kit/common/file` — OSS 上传与读取（参考 `skill-manager/_fileStore`）
- `@/modules/aiApi` — Mimo Teach Agent（Phase 2+）

## 参考

- teach skill：`~/.agents/skills/teach/SKILL.md`
- 样例工作区：`~/Desktop/musicStudy/`
- 文件存储参考：`src/app/api/skill-manager/_fileStore.ts`
