# teachHub 子任务索引

| 文档 | 任务 ID | 阶段 | 依赖 |
|------|---------|------|------|
| [ST-01 模块脚手架](./ST-01-module-scaffold.md) | T-01 | P1 | — |
| [ST-02 数据库](./ST-02-database-schema.md) | T-02 | P1 | ST-01 |
| [ST-03 OSS 文件层](./ST-03-oss-file-layer.md) | T-03 | P1 | ST-01 |
| [ST-04 API 路由](./ST-04-api-routes.md) | T-04 | P1 | ST-02, ST-03 |
| [ST-05 仪表盘 UI](./ST-05-workspace-ui.md) | T-05 | P1 | ST-04 |
| [ST-06 课时播放器](./ST-06-lesson-viewer.md) | T-06 | P1 | ST-04 |
| [ST-07 进度追踪](./ST-07-progress-tracking.md) | T-07 | P1 | ST-04, ST-06 |
| [ST-08 Mission 编辑](./ST-08-mission-editor.md) | T-08 | P1 | ST-04, ST-05 |
| [ST-09 Teach Agent](./ST-09-teach-agent.md) | T-09 | P2 | ST-03, ST-04 |
| [ST-10 生成下一课](./ST-10-generate-lesson-flow.md) | T-10 | P2 | ST-07, ST-08, ST-09 |
| [ST-11 实验田注册](./ST-11-experiment-register.md) | T-11 | P1 | ST-05 |

建议开发顺序：**ST-02 ∥ ST-03 → ST-04 → ST-05 → ST-06 → ST-07 → ST-08 → ST-11 → ST-09 → ST-10**
