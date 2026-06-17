# ST-10 生成第一课 / 下一课流程

**任务 ID**：T-10  
**状态**：done  
**依赖**：ST-07, ST-08, ST-09  
**阶段**：Phase 2

## 目标

用户在工作区主页点击按钮，触发 Agent 备课并刷新课时列表。

## 交付物

- [x] `POST /api/teach-hub/workspaces/[id]/generate/route.ts`
- [x] `GET .../generate` + `GET .../generate/[jobId]`
- [x] `components/GenerateLessonButton.tsx`
- [x] WorkspacePage 集成：「开始第一课」「生成下一课」

## 触发条件

| 按钮 | trigger | 前置条件 |
|------|---------|---------|
| 开始第一课 | `first_lesson` | `lessons/` 为空；MISSION Why 非空 |
| 生成下一课 | `next_lesson` | 最后一课 `completed`；无 running job |

## 流程

```
1. 创建 teach_generate_jobs status=pending
2. 读 OSS 上下文 + DB 进度
3. 调用 teach.generateLesson（同步或后台 job）
4. 校验 → 写 lessons/ + learning-records/
5. job status=success，更新 workspace lesson_count
6. 为新课创建 progress 行 available
7. 前端轮询或 await 完成后刷新
```

## UI 状态

- idle / generating（Loading）/ success / error
- error 显示 `error_message`，提供重试

## 验收标准

1. 空工作区 + Mission → 生成 `0001-*.html`
2. 完成 0001 → 生成 `0002-*.html` + record
3. 并发生成被锁（同一 workspace 仅一个 running job）

## 子步骤

1. generate API + job 表写入
2. 调用 ST-09 task
3. OSS 写入 + progress 初始化
4. GenerateLessonButton + WorkspacePage
