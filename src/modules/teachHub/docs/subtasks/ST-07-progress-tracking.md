# ST-07 进度追踪

**任务 ID**：T-07  
**状态**：pending  
**依赖**：ST-04, ST-06

## 目标

用户可标记课时完成，仪表盘与工作区主页显示进度。

## 交付物

- [ ] `store/teachHubStore.ts` — 客户端进度缓存（可选）
- [ ] `components/ProgressBar.tsx`
- [ ] LessonPage「标记完成」按钮逻辑
- [ ] 打开工作区时同步 `teach_lesson_progress` 与 OSS lesson 列表

## 行为规则（Phase 1）

1. 首次打开工作区：根据 `listLessons` 为每课创建 `available` 进度行（若不存在）
2. 用户点「标记完成」→ `status: completed`，写 `completed_at`
3. 可选输入 quiz 分（手动，Phase 1 不自动捕获）
4. 更新 `teach_workspaces.lesson_count` 与已完成数缓存（可计算不存）

## API

- `POST /workspaces/:id/progress` body:
  ```json
  {
    "lessonSlug": "0001-sound-and-pitch",
    "status": "completed",
    "quizScore": 4,
    "quizTotal": 4
  }
  ```

## 验收标准

1. 标记完成后刷新页面状态保持
2. 工作区卡片显示 `1/1` 或 `n/m`
3. 已完成课在列表有 ✓ 标识

## 后续（T-12）

- iframe postMessage 自动提交 quiz 分

## 子步骤

1. progress API 完善
2. ProgressBar 组件
3. LessonPage 标记完成
4. HomePage / WorkspacePage 展示进度
