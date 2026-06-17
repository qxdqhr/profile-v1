# ST-06 课时 iframe 播放器

**任务 ID**：T-06  
**状态**：pending  
**依赖**：ST-04

## 目标

原样渲染 `lessons/*.html`，支持课内链接跳转与基础导航。

## 交付物

- [ ] `components/LessonViewer.tsx` — iframe + sandbox
- [ ] `pages/LessonPage.tsx` — 标题栏 + Viewer + 操作栏
- [ ] `app/.../teachHub/w/[workspaceId]/lesson/[slug]/page.tsx`
- [ ] `utils/htmlLinkRewriter.ts`（若 ST-04 未完整实现则在此补齐）

## LessonViewer 规范

```tsx
<iframe
  sandbox="allow-scripts allow-same-origin"
  srcDoc={rewrittenHtml}
  className="w-full flex-1 border-0"
  title={lessonTitle}
/>
```

## 操作栏

- 「上一课」「下一课」（按 NNNN 顺序）
- 「标记本章完成」→ ST-07
- 「返回工作区」

## 链接改写规则

| 原文 | 改写为 |
|------|--------|
| `../reference/foo.html` | `/testField/teachHub/w/{id}/reference/foo` |
| `../lessons/0002-x.html` | `/testField/teachHub/w/{id}/lesson/0002-x` |
| `../MISSION.md` | `/testField/teachHub/w/{id}/mission` |

## 验收标准

1. `musicStudy` 第 1 课测验可点击、可计分（iframe 内）
2. 课内 reference 链接在平台内打开，不 404
3. 无 XSS：仅 allow-scripts allow-same-origin，不用 allow-top-navigation

## 子步骤

1. API 返回改写 HTML
2. LessonViewer 组件
3. LessonPage 路由 + 上下课导航
4. 用 musicStudy 0001 做手工验收
