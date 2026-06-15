# ST-09 Teach Agent 任务

**任务 ID**：T-09  
**状态**：done  
**依赖**：ST-03, ST-04  
**阶段**：Phase 2

## 目标

注册 Mimo Teach Agent 任务，读取用户工作区上下文，输出符合 teach skill 契约的文件内容。

## 交付物

- [x] `ai/teachAgentPrompt.ts` — system + user 模板
- [x] `ai/generateLessonTask.ts` — `teach.generateLesson`
- [x] `registerCoreTasks.ts` 注册 teach 任务
- [x] 内置 `teachSkillSystemPrompt.ts` 精简 teach skill

## 任务定义

| taskId | 说明 |
|--------|------|
| `teach.generateLesson` | 生成下一课 HTML + 可选 reference + learning-record |
| `teach.answerQuestion` | Phase 3 课内答疑 |

## 输入上下文（generateLesson）

```ts
{
  workspaceId: string;
  trigger: 'first_lesson' | 'next_lesson';
  missionMarkdown: string;
  learningRecords: string[];  // 全文
  existingLessons: string[];  // slug 列表
  lastQuizResult?: { score: number; total: number };
  notesMarkdown?: string;
}
```

## 输出契约

Agent 返回结构化 JSON（由 task handler 解析后写 OSS）：

```ts
{
  lesson: { order: number; slug: string; html: string };
  learningRecord?: { order: number; slug: string; markdown: string };
  reference?: { slug: string; html: string };
}
```

## 校验（写 OSS 前）

1. `order` = max(existing) + 1
2. HTML 含 `<!DOCTYPE` 或 `<html`
3. slug 与文件名一致
4. 失败不写 OSS，job status = failed

## 验收标准

1. `pnpm ai:test-mimo` 环境可用
2. 对空工作区调用 generate → 返回合法 JSON
3. 不写坏文件到 OSS

## 子步骤

1. 内置或加载 teach/SKILL.md
2. teachAgentPrompt 模板
3. registerTeachTasks + Mimo 调用
4. 输出校验器
