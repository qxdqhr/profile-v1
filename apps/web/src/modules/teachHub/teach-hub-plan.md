# teachHub 开发计划

## 产品定位

**teach skill 的多租户图形化壳**：一用户 · 多工作区 · 自管进度 · 自触发续课。

| 原则 | 说明 |
|------|------|
| 用户自有工作区 | OSS 路径 `teach-hub/{userId}/{workspaceId}/` |
| 内容格式不变 | 沿用 teach skill 目录契约，HTML 原样 iframe 播放 |
| 状态与内容分离 | OSS = 内容源；DB = 进度 / 索引 / Agent 任务 |
| 无管理员运营课 | 用户创建主题 → 填 Mission → 自己点「生成下一课」 |
| Agent 在站内 | Mimo + teach/SKILL.md，不依赖 Cursor |

## 技术选型

| 层 | 选型 |
|----|------|
| 框架 | Next.js App Router + React + TailwindCSS |
| UI | animal-island-ui（与 fitnessPlan 一致） |
| 鉴权 | `@/lib/auth` AuthGuard |
| 文件存储 | sa2kit OSS，`moduleId: teach-hub` |
| 数据库 | Drizzle + PostgreSQL |
| 课时渲染 | iframe + 链接改写（不转 React） |
| 备课 Agent | aiApi + Mimo（Phase 2） |

## 阶段划分

### Phase 1 — 工作区骨架 + 手动学习（当前目标）

- [x] ST-01 模块目录与文档
- [x] ST-02 数据库 schema + migrate
- [x] ST-03 OSS 文件层（读写 / 列表 / zip）
- [x] ST-04 API 路由（工作区 CRUD、文件代理）
- [x] ST-05 工作区仪表盘 UI
- [x] ST-06 课时 iframe 播放器
- [x] ST-07 进度追踪（手动标记完成）
- [x] ST-08 Mission 编辑器
- [x] ST-11 实验田注册 + build 验证

**交付标准**：登录用户可新建工作区、上传 `musicStudy` zip、浏览 Mission/课时、标记完成、刷新后进度仍在。

### Phase 2 — 用户触发 Mimo 备课

- [x] ST-09 Teach Agent 任务注册
- [x] ST-10 生成第一课 / 下一课流程

**交付标准**：用户填 Mission 后点「生成下一课」，OSS 出现新 `lessons/NNNN-*.html` 与 `learning-records`。

### Phase 3 — 体验增强（后续）

- 测验 postMessage 自动记分
- 间隔重复复习队列
- 工作区 zip 导出
- 公共 starter 模板 fork
- 课内 Mimo 答疑面板

## 目录结构（目标）

```
src/modules/teachHub/
  teach-hub-plan.md          ← 本文件
  README.md
  index.ts
  types/index.ts
  db/schema.ts
  docs/
    TASKS.md
    DATA.md
    ARCHITECTURE.md
    subtasks/ST-*.md
  services/
    teachHubFileStore.ts     # OSS 封装
    teachHubClient.ts        # 前端 API 客户端
    workspaceService.ts
    lessonService.ts
  api/                       # Route handlers（或 app/api/teach-hub/）
  hooks/
    useTeachHubBootstrap.ts
  store/
    teachHubStore.ts
  components/
    WorkspaceCard.tsx
    LessonViewer.tsx
    MissionEditor.tsx
    ProgressBar.tsx
  pages/
    TeachHubHomePage.tsx
    WorkspacePage.tsx
    LessonPage.tsx
  layout/
    TeachHubLayout.tsx
  utils/
    teachWorkspacePaths.ts
    htmlLinkRewriter.ts
    workspaceValidator.ts
  ai/
    teachAgentPrompt.ts
    registerTeachTasks.ts

src/app/(pages)/testField/(utility)/teachHub/
  layout.tsx
  page.tsx
  new/page.tsx
  w/[workspaceId]/page.tsx
  w/[workspaceId]/mission/page.tsx
  w/[workspaceId]/lesson/[slug]/page.tsx
  w/[workspaceId]/reference/[slug]/page.tsx
  w/[workspaceId]/records/page.tsx
  w/[workspaceId]/settings/page.tsx

src/app/api/teach-hub/
  workspaces/route.ts
  workspaces/[id]/route.ts
  workspaces/[id]/files/route.ts
  workspaces/[id]/files/[...path]/route.ts
  workspaces/[id]/import/route.ts
  workspaces/[id]/export/route.ts
  workspaces/[id]/progress/route.ts
  workspaces/[id]/generate/route.ts   # Phase 2
```

## 验收清单（Phase 1）

1. 非登录用户无法访问工作区 API
2. 用户 A 无法读取用户 B 的 `workspaceId`
3. 上传含 `lessons/0001-*.html` 的 zip 后，仪表盘显示 1 课
4. 打开课时页，iframe 内测验可交互
5. `pnpm run build` 通过，实验田可见 teachHub 入口

## 参考实现

- OSS 文件：`src/app/api/skill-manager/_fileStore.ts`
- 多页模块：`src/modules/fitnessPlan/`
- AI 任务：`src/modules/aiApi/`
- 样例工作区：`/home/qhr/Desktop/musicStudy/`
