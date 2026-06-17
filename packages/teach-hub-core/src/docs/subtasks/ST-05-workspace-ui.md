# ST-05 工作区仪表盘 UI

**任务 ID**：T-05  
**状态**：pending  
**依赖**：ST-04

## 目标

实现 teachHub 入口与工作区列表、新建、工作区主页导航骨架。

## 交付物

- [ ] `layout/TeachHubLayout.tsx` — AuthGuard + 导航
- [ ] `pages/TeachHubHomePage.tsx` — 工作区卡片列表
- [ ] `pages/NewWorkspacePage.tsx` — 创建表单
- [ ] `pages/WorkspacePage.tsx` — 工作区主页（侧栏 + 课时列表）
- [ ] `components/WorkspaceCard.tsx`
- [ ] `components/WorkspaceSidebar.tsx`
- [ ] `hooks/useTeachHubBootstrap.ts` — 拉列表
- [ ] `app/(pages)/testField/(utility)/teachHub/` 路由文件

## 页面要素

### 仪表盘

- 卡片：标题、topic、进度 `completed/total`、lastOpenedAt
- 按钮：新建工作区、继续学习（跳转 last lesson）

### 新建工作区

- 字段：title、topic（可选）、Mission Why 草稿（可选）
- 可选：上传 zip（调用 import API）
- 提交 → POST /workspaces → 跳转工作区主页

### 工作区主页

- 左栏：Mission 摘要、Records、Resources、Reference 链接
- 主区：Lessons 列表（序号、标题、完成状态）
- 底栏：继续学习 / 生成下一课（Phase 2 占位禁用）

## UI 风格

- `animal-island-ui`：Title、Card、Button、Loading
- 参考 `fitnessPlan/layout/FitnessPlanLayout.tsx`

## 验收标准

1. 登录后可见自己的工作区列表
2. 新建空工作区成功跳转
3. 导入 zip 后列表显示 lesson 数量
4. 移动端侧栏可折叠

## 子步骤

1. TeachHubLayout + 路由 layout.tsx
2. HomePage + WorkspaceCard
3. NewWorkspacePage
4. WorkspacePage + Sidebar
5. useTeachHubBootstrap
