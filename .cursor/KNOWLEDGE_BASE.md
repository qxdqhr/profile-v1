# profile-v1 本地知识库（架构与约定）

本文档为 **单一事实来源（SSOT）**，描述本仓库的 **App Router 挂载方式**、**模块目录约定** 与 **实验田注册**。

**Cursor 自动加载**：项目规则 `.cursor/rules/profile-v1-knowledge-ssot.mdc` 设为 `alwaysApply: true`，并在规则正文中使用官方支持的 `@.cursor/KNOWLEDGE_BASE.md`，在本仓库的每次 Agent 对话中把本文档纳入上下文（见 [Cursor Rules 文档](https://cursor.com/docs/rules) 中 “@include files” 的说明）。仍可在对话里手动 `@.cursor/KNOWLEDGE_BASE.md` 强化引用。根目录 `AGENTS.md` 指向此处。

---

## 1. 技术栈与命令

| 项 | 约定 |
|----|------|
| 框架 | Next.js（App Router，主站在 `apps/web/src/app`） |
| Monorepo | pnpm workspace：`apps/web`（`@profile/web`）、`packages/*`（`@profile/config/auth/db/ui`）；详见 `docs/monorepo-migration/` |
| 样式 | Tailwind CSS；预设 `@profile/ui/tailwind.preset` |
| 数据层 | Drizzle ORM + PostgreSQL（`@profile/db`，迁移目录 `drizzle/` 在仓库根） |
| 包管理 | **pnpm**；开发 `pnpm dev` = `pnpm --filter @profile/web dev` |

---

## 2. 路由总览（URL 不包含 Route Group 段名）

物理目录使用 **Route Group** 括号文件夹组织，**浏览器路径不出现** `(pages)`、`(utility)` 等片段。

### 2.1 主布局前缀

- 多数业务页面在：`apps/web/src/app/(pages)/...`
- 顶层另有少量路由（如 `src/app/page.tsx`、`src/app/timestamp/` 等），按具体需求放置。

### 2.2 实验田 `testField`

根路径：`/testField`（入口页面对应 `src/app/(pages)/testField/page.tsx`）。

| Route Group（磁盘路径） | 典型用途 | 路由示例 |
|-------------------------|----------|----------|
| `(utility)/` | 工具、配置页、无 Phaser 的实验功能 | `/testField/qrCode`、`/testField/ideaList` |
| `(sa2kit)/` | Phaser 小游戏、MMD/音视频相关实验 | `/testField/suikaGame` |
| `(game)/` | 另一类游戏/互动实验 | `/testField/mikutap` |
| `(cyhj)/` | 业务向模块（如画集） | `/testField/ShowMasterPieces` |

**选择建议**

- 纯工具、表单、管理后台 → `(utility)/<segment>/page.tsx`
- Phaser 3 小游戏（见全局 Skill `profile-v1-minigame`）→ `(sa2kit)/<gameName>/page.tsx`
- 其他游戏/玩法原型 → `(game)/` 或沿用同目录下已有同类模块的分组
- 强业务、与「画集」类同形态 → `(cyhj)/`

### 2.3 路由文件写法（薄封装）

`page.tsx` **只做导入与默认导出**，业务 UI 放在 `src/modules/<模块名>/`：

```tsx
import { XxxPage } from '@/modules/xxx'

export default function XxxRoute() {
  return <XxxPage />
}
```

需要模块级副作用（如初始化）时，优先在 **layout** 统一 `import '@/modules/.../init'`（ShowMasterPieces 已采用）；薄 `page.tsx` 仅 re-export 组件。

ShowMasterpiece 已自 sa2kit 迁入 `src/modules/showmasterpiece/`，见 `MIGRATION_FROM_SA2KIT.md`。

### 2.4 API 路由与模块代码的对应关系

- **实现**放在模块内：`src/modules/<module>/api/**/route.ts`
- **对外 HTTP 路径**在：`src/app/api/.../route.ts` 中 **re-export** 模块内 handlers（参考 `ideaList` → `src/app/api/ideaLists/**`）

这样保持「按功能模块聚合」，同时符合 Next.js 对 `app/api` 的位置要求。

### 2.5 `examples` 与 `testField`

- `src/app/(pages)/examples/**`：演示、联调、PoC，**不一定**进实验田列表。
- `src/app/(pages)/testField/**`：实验田导航展示的主阵地；**新实验功能若需入口卡片，必须注册实验数据**（见第 4 节）。

---

## 3. 模块（`src/modules/<name>/`）约定

### 3.1 纯工具 / 无数据库模块

完整流程见项目内 Skill：`.cursor/skills/build-utility-module/SKILL.md`（DEVELOPMENT.md → 组件 → 薄 `page.tsx` → `experimentData.ts`）。

推荐目录要点：

- `index.ts`：统一导出页面、组件、类型、工具
- `components/`、`pages/`、`types/`、`utils/` 按需
- 客户端组件文件顶部：`'use client'`

### 3.2 含数据库与 API 的模块

以 **`ideaList`** 为参考模板（**注意**：历史规则中提到的 `module/auth` 在当前仓库中不存在，以 `ideaList` 为准）：

- `db/schema.ts`、`db/*DbService.ts`
- `api/**/route.ts`（由 `src/app/api/...` 转发）
- `hooks/`、`services/`、`pages/`
- 根目录 `DEVELOPMENT.md`：分步 checklist，随开发更新
- 新表需在 `src/db/index.ts` 中挂载 schema；迁移与多环境命令以 `package.json` 脚本为准

### 3.3 公共 UI 组件

跨模块复用、且适合泛型抽象的组件 → `src/components/`。

---

## 4. 实验田数据：`experimentData.ts`

- 路径：`src/modules/testField/utils/experimentData.ts`
- 导出数组：`experiments`
- 类型：`ExperimentItem`（`src/modules/testField/types/index.ts`）
- **`category` 仅允许**：`'utility' | 'leisure'`
- **`path`**：必须与真实 `page.tsx` 对应的 URL 一致（注意大小写；Linux 部署区分大小写）
- 新增条目：在数组 **末尾** 追加一项，便于合并与审计

---

## 5. Cursor 侧资产索引

| 资产 | 路径 | 作用 |
|------|------|------|
| 全局规则 | `.cursor/rules/cursorrule.mdc` | 全项目 always-on 简短约束 |
| SSOT 自动注入 | `.cursor/rules/profile-v1-knowledge-ssot.mdc` | `alwaysApply: true` + `@.cursor/KNOWLEDGE_BASE.md`，每轮对话附带知识库 |
| 本知识库 | `.cursor/KNOWLEDGE_BASE.md` | 路由 + 模块 + 实验田 SSOT（正文由上文规则引用） |
| 工具模块 Skill | `.cursor/skills/build-utility-module/SKILL.md` | 无 DB 模块分步流程 |
| 小游戏 Skill（用户级） | `~/.cursor/skills/profile-v1-minigame/SKILL.md` | Phaser + `(sa2kit)` 流程 |
| 按路径触发的规则 | `.cursor/rules/profile-v1-routing.mdc`、`profile-v1-modules.mdc` | 编辑 `src/app` / `src/modules` 时注入上下文 |

---

## 6. 变更本知识库的时机

在发生以下情况时，应同步更新本文档（及必要时更新对应 `.mdc`）：

- 新增或合并 Route Group
- 约定「API 一律从模块 re-export」的路径命名变化
- `ExperimentItem` 类型或 `category` 枚举扩展
- 新的「标准参考模块」取代 `ideaList` 作为模板
