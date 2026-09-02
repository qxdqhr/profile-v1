# Phase U0 — UI 全链路盘点与迁移计划

> 日期：2026-08-29（修订：全量 UI 回签 + showmasterpiece 强制动森）  
> **进度更新：2026-08-29 16:50** — **Phase U 主体完成**（U0～U6 门禁脚本已落地）；`pnpm gate:ui` / sa2kit `pnpm gate:ui`  
> 状态：**执行中**  
> 服务北极星：接单多端可复用；执行优先级：北极星 > **本计划（UI 统一）** > 业务试点 / 功能优化  
> 蓝图：[BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md) §0 / §5 / §7 Phase U

---

## 进度总览（滚动更新）

| 阶段 | 状态 | 备注 |
|------|------|------|
| U0 盘点 | ✅ | 本文件 |
| U1 门面 + HomeV2 | ✅ | `sa2kit/common/ui` + write-ui-facade；HomeV2 经门面 |
| U2 子应用换轨 | ✅ | calendar/teach-hub 去 animal-island；smp → `ui/admin` + ThemeProvider；calendar/smp **build 绿** |
| U3 去 web alias | ✅ | Home/fitnessPlan → 门面；next alias 已删（docs 文案残留可后清） |
| **U4 Mobile** | ✅ | 两边删手写实现；门面 `sa2kit/common/ui/rn`；`tsc --noEmit` 绿 |
| **U5 全量升格 / 清 components** | ✅ | profile 源码零直引；components 仅再导出 |
| **U6 门禁** | ✅ | `pnpm gate:ui`；sa2kit eslint 禁 animal-island-ui |

### 本地联调备忘

- profile：`pnpm.overrides.sa2kit = link:../sa2kit`（三仓同级目录；须 `link:` 才能跟本地 dist 热更新）
- mobile：`sa2kit` / `@sa2kit-ui/*` 使用相对 `link:../../../sa2kit(-ui)/...`
- `pnpm build:common` 会 `clean` 整个 dist → 需再 `pnpm build:business && node scripts/write-ui-facade.mjs`
- smp 管理台走 **`sa2kit/common/ui/admin`**（动森 + shadcn 复合 API 兼容）；声明式件走 `sa2kit/common/ui`
- mobile：`sa2kit/common/ui/rn` **types→dist 自包含门面**，runtime→src；宿主 link `@sa2kit-ui/rn` + theme.mobile.css + NativeWind preset
- 模式件：`sa2kit/common/ui/patterns`（BackButton / SearchBox / SearchResultHint / FilterButtonGroup）
- widgets：`sa2kit/common/ui/widgets`（CollisionBalls / Timeline / Grid / OrderManager / ImageMapping*）
- auth 壳：`sa2kit/common/ui/auth`（AuthModalShell / Field / ModeChips…）；组装仍在 `common/auth/components/styled`

---

## 1. 目标

把 profile-v1 + sa2kit 全链路中「满天飞」的基础 UI **收敛到 sa2kit-ui**，使：

1. 相同功能只保留一套实现（主题由 ThemeProvider 切换样式）。  
2. 后期客户仓可直接依赖 `@sa2kit-ui/*`（或经 `sa2kit/common/ui*` 门面）。  
3. sa2kit-ui 之后只做：**新主题** + **确缺的新组件**。

---

## 2. 现状拓扑

```
sa2kit-ui (@sa2kit-ui/react = @qhr123/sa2kit-ui-react@0.1.6)
    ▲ 直连                    ▲ webpack alias
 HomeV2                    web Home / fitnessPlan（字面 animal-island-ui）

animal-island-ui@0.9.8
    ▲ 真依赖
 calendar-core / teach-hub-core / apps/calendar|teach-hub
 showmasterpiece（声明但源码零引用 → 死依赖）

sa2kit/common/components（自建 shadcn，无 Radix）
    ▲
 showmasterpiece-core · web 实验页 · calendar 少量

手写 RN src/ui（两套近乎拷贝）
    ▲
 calendar-mobile / teach-hub-mobile

sa2kit/common/ui 门面 → ❌ 未实现
sa2kit package.json → ❌ 未依赖 @sa2kit-ui/*
```

---

## 3. sa2kit-ui 已有资产（迁移目标侧）

### 3.1 已导出组件（24 + 附赠）

| 组件 | Web `@sa2kit-ui/react` | RN | Taro |
|------|:---:|:---:|:---:|
| Button / Input / Switch / Card | ✅ | 源码✅ | ✅ dist |
| Modal / Title / Tabs / Collapse | ✅ | 源码✅ | ✅ |
| Checkbox / Radio / Tooltip / Select | ✅ | 源码✅ | ✅ |
| Loading / Divider / Time / CodeBlock / Table | ✅ | 源码✅ | ✅ |
| Icon / Footer / Phone / Cursor / Wallet | ✅ | 源码✅ | ✅ |
| Typewriter / WeddingInvitation(+Export) | ✅ | 源码✅ | ✅ |
| ThemeProvider / useTheme / SA2_THEMES | ✅ | ❌ | ❌ |

主题 id：`animal-island` · `jieyuan-garden` · `rhine-life` · `endfield` · `mizuki-roguelike` · `sami-roguelike` · `tech`（仅 tokens，无独立 theme 包）。

### 3.2 发布缺口（计划内须补）

| 项 | 现状 | 计划动作 |
|----|------|----------|
| npm | 仅 `@qhr123/sa2kit-ui-react@0.1.6` | 维持单包；门面侧 alias 到此 |
| `@sa2kit-ui/rn` | **无 dist**，仅 TS 源码 | ✅ U4：宿主 link 源码 + Metro watchFolders；sa2kit 门面 types 自包含 |
| CSS 体积 | 全主题 ~1.3MB | 不挡 U1–U3；可后置按主题分包 |

---

## 4. 消费侧统计摘要

### 4.1 依赖矩阵

| 包 | animal-island-ui | @sa2kit-ui/react | sa2kit/common/components | 手写 ui |
|----|:---:|:---:|:---:|:---:|
| apps/web | 字面 import + **alias** | HomeV2 直连 | 实验页 | — |
| calendar-core / apps/calendar | ✅ 真依赖 | ❌ | 少量 | — |
| teach-hub-core / apps/teach-hub | ✅ 真依赖 | ❌ | ❌ | — |
| showmasterpiece | ✅ **死依赖** | ❌ | — | — |
| showmasterpiece-core | ❌ | ❌ | ✅ 主 UI | 业务编排 ui/ |
| calendar-mobile | ❌ | ❌ | ❌ | ✅ Button/Input/Modal/Title/Loading |
| teach-hub-mobile | ❌ | ❌ | ❌ | ✅ 同上 + Card（与 calendar 拷贝） |

### 4.2 动森轨高频符号（animal-island 字面 import，约 49 文件）

| 次数 | 符号 | sa2kit-ui 已有？ |
|-----:|------|:---:|
| 42 | Button | ✅ |
| 23 | Title | ✅ |
| 22 | Card | ✅ |
| 11 | Modal | ✅ |
| 8 | Loading / Input | ✅ |
| 7 | Select | ✅ |
| 4 | Footer / Divider | ✅ |
| 3 | Switch | ✅ |
| ≤2 | Cursor, Collapse, Time, Typewriter, Icon, Tooltip, Radio, Tabs | ✅ |

→ **字面动森消费与 sa2kit-ui 几乎 1:1，迁移以换包名为主，无需大量新组件。**

### 4.3 `@sa2kit-ui/react`（HomeV2，8 文件）

已用：Button、Modal、Cursor、Footer、Time、Typewriter、Collapse、Icon、Tooltip、Input、ThemeProvider、useTheme。

### 4.4 `sa2kit/common/components`（约 32 文件）

高频：Button、Modal、Card*、BackButton、Badge、ConfirmModal、SearchBox、Tabs*、CollisionBalls、FilterButtonGroup、Input、Label…

---

## 5. 可复用 / 迁移分类（2026-08-29 修订：全量回迁）

> **拍板**：凡是 **UI 组件**（含 auth 壳、域面板、装饰件、business 页内可拆件、showmasterpiece 管理台）**一律回签到 sa2kit-ui**。  
> sa2kit / profile **只保留**：领域逻辑、hooks、server、路由薄壳、对 UI 的组装。  
> showmasterpiece：**强制动森视觉**（经 sa2kit-ui），禁止继续用 shadcn 轨。

分层约定：

| 层 | 落点 | 例子 |
|----|------|------|
| **表现 / 组件** | **只在 sa2kit-ui** | Button、LoginForm 外观、CollisionBalls、ImageMappingPanel、画集列表卡片… |
| **逻辑 / 数据** | sa2kit common 或 business / `*-core` | Better Auth session、OSS API、画集 DbService |
| **组装 / 路由** | profile 或 business `ui/*` 薄页 | `page.tsx` 调 hooks + 拼 sa2kit-ui 组件 |

### A. 已在 sa2kit-ui → **只换引用**

Button · Title · Card · Modal · Input · Loading · Select · Switch · Footer · Divider · Tabs · Tooltip · Collapse · Time · Typewriter · Icon · Radio · Cursor · Checkbox · Table · …

覆盖：动森轨 ~49 文件 + HomeV2 +（换轨后）calendar / teach-hub / **showmasterpiece-core**。

### B. 须 **新迁入 / 重做进 sa2kit-ui**（原「不迁」已撤销）

#### B1. 模式件（原 common 半通用）

| 来源 | 组件 | 阶段 |
|------|------|------|
| common/components | BackButton、SearchBox、SearchResultHint、FilterButtonGroup、Grid | U5 |
| common/components | ConfirmModal → 并入 Modal confirm 模式或独立 ConfirmModal | U5 |
| common/components | Badge、Label、Textarea、Avatar、Progress、Separator、ScrollArea、Dialog/Sheet/Dropdown/Popover 等 shadcn 复合 | U5：动森化重做或映射到已有件后删除 common 实现 |

#### B2. auth **壳 UI**（逻辑留 `sa2kit/common/auth`）

| 组件 | 迁入方式 | 阶段 |
|------|----------|------|
| LoginModal / RegisterModal / ForgotPasswordModal | 视觉进 sa2kit-ui；auth 包只提供 headless hooks + 组装导出 | U5-auth |
| UserMenu | 同上 | U5-auth |
| AuthGuard / PermissionGuard 的 **无权限占位 UI** | 占位视图进 ui；鉴权判断留 auth | U5-auth |
| RN AccountLoginForm 等 | `@sa2kit-ui/rn` + auth hooks | U4/U5 |

#### B3. 域面板 / 装饰 / 工具 UI（原「留 common」）

| 组件 | 阶段 |
|------|------|
| CollisionBalls、Timeline | U5-widget |
| GenericOrderManager、ImageMappingPanel、LocalImageMappingPanel | U5-widget |
| universalFile / universalExport / imageCrop / aiApi / analytics / i18n 相关 **展示组件** | U5-widget（按模块分批；逻辑服务留 sa2kit） |

#### B4. business / 宿主页内 UI 件（原「整页不迁」）

| 范围 | 迁入原则 | 阶段 |
|------|----------|------|
| testField EmptyState、SortModeToggle、CategoryFilter… | 去硬编码文案或保留可配置 props，进 sa2kit-ui | U5-biz |
| portfolio ExperimentCard、profile Stat/BadgeList/EnhancedAvatar | 通用化后进 ui | U5-biz |
| navigation FloatingMenu 等 | 进 ui | U5-biz |
| festivalCard / mmd / 游戏等 | **可复用控件**进 ui；**玩法/canvas/领域页骨架**仍 business，但禁止私有 Button/Modal | U5-biz 起，随模块触及 |
| showmasterpiece-core 全套管理台 UI | **强制**改为 sa2kit-ui 动森件；缺件先在 ui 补再引用 | **U2.4 / U5-smp**（见下） |

#### B5. Mobile 手写

| 项 | 动作 | 阶段 |
|----|------|------|
| calendar-mobile / teach-hub-mobile `src/ui` | 删实现，吃 rn；缺件补进 sa2kit-ui | U4 |

### C. **不再存在「明确不迁 UI」**

仅下列 **非 UI** 留在 sa2kit / core（不进 sa2kit-ui）：

- auth/session/schema/server、OSS/file 服务、config、AI task 注册、DbService、domain 纯逻辑  
- Phaser/Three 等运行时场景（非设计系统控件）  
- 路由 `page.tsx` / API re-export  

### D. 删除 / 清理

| 项 | 动作 |
|----|------|
| animal-island-ui 一切依赖 | U2–U3 删光 |
| web animal-island alias | U3 删 |
| `sa2kit/common/components` 整包 | U5 迁完后删除或仅 re-export ui（过渡期 deprecated） |
| 双份 PermissionGuard | 逻辑并 auth；UI 并 ui |
| showmasterpiece 死依赖 animal-island | U2.3 删；**同时** core 换动森（U2.4） |

### 数量结论（修订）

| 类别 | 约数 / 范围 |
|------|-------------|
| 已可复用、换轨即可 | ~20 组件名（动森 + 后续 smp） |
| **须迁入 sa2kit-ui（扩大后）** | B1～B5：**模式件 + auth 壳 + 域面板 + business 可拆件 + showmasterpiece 管理台**（数十个文件级，分批） |
| 明确不迁 | **仅非 UI 逻辑**（无「UI 例外清单」） |
| RN 手写 | 2 套删除 → 1 套 rn |

---

## 6. 修改计划（分 PR / 阶段）

> 原则：**所有 UI → sa2kit-ui**；逻辑留 sa2kit；showmasterpiece **强制动森**；festivalCard 功能试点仍后移，但其 UI 触及规则立即遵守。

### U0 — 本文件（✅）

- [x] 全链路盘点  
- [x] 可复用分类与数量  
- [x] 分阶段计划  
- [x] 全量回迁 + showmasterpiece 强制动森（本修订）

### U1 — sa2kit UI 门面 + HomeV2

| 步骤 | 仓 | 内容 | 验收 |
|------|-----|------|------|
| U1.1 | sa2kit | 依赖 `@sa2kit-ui/react`；`src/common/ui` 再导出 | ✅ `sa2kit/common/ui` 可用（手写 facade + write-ui-facade） |
| U1.2 | profile web | HomeV2 → 门面 | ✅ |
| U1.3 | profile web | Loading/Error 去 animal 路径 | ✅ `HomeV2Loading` / `HomeV2Error` |

### U2 — 子应用换轨（含 showmasterpiece **强制动森**）

| 步骤 | 仓 | 内容 | 验收 |
|------|-----|------|------|
| U2.1 | calendar-core + apps/calendar | animal-island → 门面；删依赖 | ✅ 源码换轨；`pnpm --filter @profile/calendar build` 绿 |
| U2.2 | teach-hub-core + apps/teach-hub | 同上 | ✅ 源码换轨 |
| U2.3 | apps/showmasterpiece | 删死依赖 animal-island + transpile | ✅ |
| **U2.4** | **showmasterpiece-core** | **`sa2kit/common/components` → `sa2kit/common/ui/admin`（动森兼容层）** | ✅ build 绿 |
| U2.5 | showmasterpiece app | ThemeProvider + style 接入 | ✅ |

### U3 — 主站去 alias

| 步骤 | 内容 | 验收 |
|------|------|------|
| U3.1 | web Home / fitnessPlan 字面 → `sa2kit/common/ui` | ✅ |
| U3.2 | 删除 `apps/web/next.config.ts` animal-island alias | ✅ |
| U3.3 | 全仓 `rg animal-island-ui`（除 docs）趋零 | ⬜ docs/描述文案仍有；源码依赖已无 |
### U4 — Mobile → `@sa2kit-ui/rn` / `sa2kit/common/ui/rn`

| 步骤 | 仓 | 内容 | 验收 |
|------|-----|------|------|
| U4.0 | sa2kit-ui / sa2kit | rn 可消费：link 源码；`sa2kit/common/ui/rn` 门面（含 Modal `visible` 兼容） | ✅ types 自包含 dist；runtime src；Modal/Input/Loading 适配 |
| U4.1 | sa2kit | 导出 `sa2kit/common/ui/rn` | ✅ package exports types→dist / import→src |
| U4.2 | calendar-mobile | 删 `src/ui/*`，改门面/rn | ✅ 仅剩 `index.ts` + `tokens.ts`；`tsc` 绿 |
| U4.3 | teach-hub-mobile | 同上（含 Card / Modal*） | ✅ 同上；AppModal 改从 `../ui` 再导出 |
| U4.4 | 两边 | tokens 与 `--sa2-*` / 主题对齐或删除平行色板 | ✅ 引入 theme.mobile.css + preset；本地 `ai` 色值对齐 primary/error 等 |

### U5 — 全量升格进 sa2kit-ui + 清空 common/components

| 步骤 | 内容 | 验收 |
|------|------|------|
| U5.1 | common 原子/复合 shadcn **迁入或映射到 ui 后删除** | ✅ 原子/复合已映射或删除；Card 槽 → admin（含 CardFooter） |
| U5.2 | B1 模式件进 ui（BackButton、SearchBox…） | ✅ `ui/patterns` + `patterns/next`（Next BackButton） |
| U5.3 | **U5-auth**：Login/Register/Forgot/UserMenu/Guard | ✅ Web `ui/auth`；RN AccountLoginForm → `ui/rn` |
| U5.4 | **U5-widget** | ✅ `ui/widgets` |
| U5.5 | **U5-biz** | ✅ business `@/components` 改指 ui；ProfileModal 已动森 |
| U5.6 | 扫尾：`rg sa2kit/common/components` → 0 或仅 re-export | ✅ profile-v1 源码 **0** 直引；sa2kit `common/components` 仅再导出层 |

### U6 — 门禁

| 步骤 | 内容 | 验收 |
|------|------|------|
| U6.1 | 禁 animal-island-ui | ✅ `gate:ui` + sa2kit eslint `no-restricted-imports` |
| U6.2 | 禁在 sa2kit/profile 新增 UI 实现（例外组装）；新组件只许 sa2kit-ui / `common/ui*` | ✅ 脚本 + 文档约定；CR 清单 |
| U6.3 | 禁新增 `sa2kit/common/components` 自研件 | ✅ sa2kit `gate:ui` 校验再导出 |
| U6.4 | 三仓 README + 接入手册；关闭 CX-011 / SUI-001 | 🔄 CX-011 标关闭；README 短更 |

---

## 7. 已拍板 / 仍开的执行细节

| # | 问题 | 决定 |
|---|------|------|
| 1 | showmasterpiece 是否强制动森？ | **是（强制）**；走 U2.4 |
| 2 | auth / 域面板 / CollisionBalls / business UI 是否迁 ui？ | **是（全部 UI 回签）**；逻辑留 sa2kit |
| 3 | ConfirmModal | 优先并入 Modal confirm 模式 |
| 4 | rn 发布 | 接单前 file/workspace 可接受 |

---

## 8. 建议执行顺序

```
U1 门面 + HomeV2
  → U2.1–2.2 calendar / teach-hub
  → U2.3–2.5 showmasterpiece 删死依赖 + core 强制动森 + ThemeProvider
  → U3 去 alias
  → U4 mobile
  → U5.1–5.6 全量升格（auth 壳 → widget → biz）+ 清空 common/components
  → U6 门禁
```

**后移**：festivalCard 多端骨架功能、非 UI 的功能优化、S2 下沉。  
**不后移**：任何新/改 UI 的落点规则（只能进 sa2kit-ui）。

---

## 9. 风险

| 风险 | 对策 |
|------|------|
| showmasterpiece-core 换动森面大 | U2.4 按路由/模块切片 PR；先 Button/Card/Modal/Input，再复杂表 |
| auth UI 与 Better Auth 耦合 | 严格拆 headless hooks（sa2kit）vs 纯展示（sa2kit-ui） |
| 域面板进 ui 是否「污染设计系统」 | ui 内分区：`primitives` / `patterns` / `widgets`（文档分区即可，可同包） |
| business 整页拆件成本高 | 先禁新建私有基础件；旧页「触及再迁」+ U5-biz 清单推进 |
| rn 无 dist | U4 ✅：link 源码 + 自包含 types 门面；接单前可后补 rn 正式 dist |
| animal ↔ sa2kit-ui props 差 | 以 sa2kit-ui 为准；差在 ui 补齐而非宿主适配层 |

## 10. 文档维护

| 完成后更新 |
|------------|
| 本文件勾选各 Ux |
| BLUEPRINT §7 Phase U |
| CROSS-CUTTING CX-011 |
| sa2kit-ui / sa2kit README 接入段 |
| KNOWLEDGE_BASE §0 / §1.1（若门面路径定名） |
