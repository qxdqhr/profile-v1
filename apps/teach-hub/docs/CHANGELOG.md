# Changelog — @profile/teach-hub

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。  
版本号与子应用 `package.json` 同步（当前 `0.1.0`）；功能性里程碑以 git 提交为准。

## [Unreleased]

### Changed
- 资源列表 UI 统一：分类改为下拉选项，支持弹窗添加条目（`2059547`）

## [0.1.0] — 2026-06-15 ~ 2026-06-20

首个可用版本：从主站模块拆分为独立子应用，完成 Phase 1 + Phase 2。

### Added — 核心功能（2026-06-15）

- **teach skill 学习工作区**：用户可创建多工作区，OSS 路径 `teach-hub/{userId}/{workspaceId}/`（`5eec553`）
- **工作区 CRUD + zip 导入**：支持 `musicStudy` 样例结构导入
- **Mission 编辑器**：结构化编辑 Why / 成功标准 / 约束 / 范围外
- **课时 iframe 播放器**：HTML 原样渲染，相对链接 API 代理改写
- **进度追踪**：手动标记课时完成，持久化至 `teach_lesson_progress`
- **Mimo 备课流程**：`teach.generateLesson` 任务，支持「开始第一课」与「生成下一课」（Phase 2）
- **数据库表**：`teach_workspaces`、`teach_lesson_progress`、`teach_generate_jobs`
- **实验田入口**：主站 testField 卡片指向 teachHub

### Added — 阅读体验（2026-06-19）

- 课时阅读页：滚动进度百分比 + 可拖拽进度条（`fb300f1`）
- 阅读进度条：四向布局（上/下/左/右）、收起/展开、与 iframe 滚动双向同步（`c02117c`）
- 设置页：阅读进度条默认展开开关（`9f9a9be`）
- 资源页：可逐项添加的条目编辑器（`3e3b0f5`）

### Changed

- 页面布局重构，样式从 CSS 迁移至 Tailwind 常量 `styles/tw.ts`（`012e6b2`）
- **Monorepo 拆分**：teachHub 从 `apps/web/src/modules/teachHub` 迁至 `apps/teach-hub` + `packages/teach-hub-core`（`8562dee`）
- 资源列表 UI 统一，分类改为选项 + 弹窗添加（`2059547`）

### Fixed

- 创建工作区体验优化；OSS 生产配置更新（`a6750e4`）
- Mission 文件 404 与保存未持久化（`e714d4b`）
- 课时 iframe 改用 `srcDoc`，规避 X-Frame-Options 拦截（`a019d51`）
- 子应用 Docker 构建缺失运行时依赖（`131f002`）
- 网关部署：子应用 URL / 登录态 / 重定向环 / 容器内 auth·DB 连接（`56449c4`, `546b827`）
- 课程详情路由重复拼接 `/teach-hub` 导致 404（`7ace545`）
- `tw.ts` 中 `thFormInput` 初始化顺序导致构建失败（`0a9f22d`）
- 阅读进度条展开收起后与正文不同步（`1d0ef6f`）
- 阅读区布局高度未填满屏幕（`3be7a5c`）
- 纵向进度条浮层显示与滑动方向（`69a6ec3`）

### Infrastructure

- 独立 Dockerfile + standalone 输出（`:3002`）
- 主站 `/teach-hub` → 子应用 302 重定向
- Nginx 同域网关 `basePath=/teach-hub`
- `instrumentation.ts` 在子应用进程注册 `teach.generateLesson`（主站不注册）

---

## 里程碑对照

| 日期 | 里程碑 |
|------|--------|
| 2026-06-15 | Phase 1 交付：手动学习闭环 |
| 2026-06-15 | Phase 2 交付：Mimo 用户触发备课 |
| 2026-06-17 | 子应用拆分 + 网关部署方案 B 收尾 |
| 2026-06-19 | 课时阅读器体验增强 |
| 2026-06-19 | 资源页编辑器 |
| 2026-06-20 | 资源 UI 统一 |

## Phase 3 Backlog（未实现）

- [ ] postMessage 测验桥（自动记 quiz 分）
- [ ] 间隔重复复习队列（`nextReviewAt`）
- [ ] 工作区 zip 导出
- [ ] 公共 starter 模板 fork
- [ ] 课内 Mimo 答疑面板

详见 `packages/teach-hub-core/docs/TASKS.md` 中 T-12 ~ T-16。
