---
name: build-utility-module
description: 在 profile-v1 项目中构建纯工具型模块（无数据库、无后端 API）。适用于封装可复用的 React 组件或工具函数，例如二维码生成、图片处理、格式转换等。当用户说"封装一个工具模块"、"新建一个 utils 模块"、"写一个工具性功能"时使用此 skill。
---

# Build Utility Module（构建工具型模块）

适用场景：纯前端工具模块，不涉及数据库和后端路由。

## 执行流程

### Step 1 — 创建 DEVELOPMENT.md（必须最先执行）

在 `src/modules/<moduleName>/DEVELOPMENT.md` 中分析需求，包含：
- 功能需求（核心功能、可选功能、测试页面功能）
- 技术方案（依赖库选择与理由）
- 模块目录结构
- 组件接口设计（Props 定义）
- 开发步骤 checklist（后续每步完成后同步更新）

### Step 2 — 安装依赖

```bash
pnpm add <package-name>
```

### Step 3 — 创建模块目录结构

```
src/modules/<moduleName>/
├── DEVELOPMENT.md
├── index.ts              ← 统一导出入口
├── types/
│   └── index.ts          ← 所有 TypeScript 类型定义
├── components/
│   ├── XxxComponent.tsx  ← 核心可复用组件
│   └── index.ts
├── utils/
│   └── index.ts          ← 纯工具函数
└── pages/
    └── XxxDemoPage.tsx   ← 演示/测试页面
```

### Step 4 — 实现核心组件

`components/XxxComponent.tsx` 顶部加 `'use client'`。  
样式全部使用 **Tailwind CSS**，同时适配桌面端和移动端（响应式布局）。  
如果组件具有通用泛型能力，提取到 `src/components/` 下。

### Step 5 — 创建模块入口 index.ts

```typescript
// 组件
export { XxxComponent } from './components'
// 类型
export type { XxxProps } from './types'
// 工具函数
export { xxxUtil } from './utils'
// 页面
export { default as XxxDemoPage } from './pages/XxxDemoPage'
```

### Step 6 — 创建测试演示页面

`pages/XxxDemoPage.tsx` 顶部加 `'use client'`。  
页面要求：
- 展示组件在各种参数下的效果
- 提供交互控件（输入框、滑块、选项等）实时调节
- 展示组件的代码使用示例

### Step 7 — 注册 App 路由

创建文件 `src/app/(pages)/testField/(utility)/<moduleName>/page.tsx`：

```tsx
import { XxxDemoPage } from '@/modules/<moduleName>'

export default function XxxRoute() {
  return <XxxDemoPage />
}
```

### Step 8 — 注册到实验田

在 `src/modules/testField/utils/experimentData.ts` 的数组末尾追加：

```typescript
{
  id: "<module-id>",
  title: "模块中文名",
  description: "简短的功能描述",
  path: "/testField/<moduleName>",
  tags: ["工具", "..."],
  category: "utility",
  isCompleted: true,
  createdAt: 'YYYY-MM-DD',
  updatedAt: 'YYYY-MM-DD'
}
```

### Step 9 — 同步更新 DEVELOPMENT.md

将 checklist 中每个已完成的步骤标记为 `[x]`。

---

## 关键约定

| 项目 | 规则 |
|------|------|
| 样式 | 仅使用 Tailwind CSS，禁止内联 style（动态值除外） |
| 响应式 | 所有页面适配移动端和桌面端 |
| 包管理 | 使用 `pnpm add` |
| 组件 | 客户端组件顶部加 `'use client'` |
| 模块路径别名 | 使用 `@/modules/<name>` 导入 |
| 公共组件 | 可复用泛型组件放到 `src/components/` |

## 与有数据库模块的区别

纯工具模块**不需要**：
- `db/schema.ts`
- `api/` 路由目录
- 更新 `src/db/index.ts`
- 运行数据库迁移命令

如果后续需要添加数据库支持，参考 `src/modules/ideaList/` 的结构。
