# 蓝图：多端 sa2kit SDK（common + business 同仓多端）

> 版本：v0.4 · 2026-08-29  
> 状态：**执行中**（**北极星：接单多端可复用** · Phase F 大域新域迁移）— 见 §0 / §7  
> 取代/修正：先前「business 迁回 profile-v1」方向（见文末 §11）  
> 源码仓：独立仓库 `github.com/qxdqhr/sa2kit` · `github.com/qxdqhr/sa2kit-ui`（profile-v1 以 git submodule 挂载于 `packages/sa2kit/` · `packages/sa2kit-ui/`，仍可 npm 发布）· 消费仓 `profile-v1` 及独立 RN/Taro/Electron 宿主

---

## 0. 北极星愿景（最高优先级）

> **profile-v1 + sa2kit + sa2kit-ui 不是「只服务个人站」的工程，而是为后期接单多端付费项目做的可复用弹药库。**

### 成功画面

接到 Web / RN / 小程序 / 桌面等**付费客户项目**时，应能：

1. **直接依赖** `sa2kit` / `sa2kit-ui`（或经 `sa2kit/common/ui*` 门面），而不是从 profile 拷代码。  
2. **即插即用**通用能力：登录（auth）、OSS/文件、配置、日志、AI 任务内核、主题与基础 UI 等。  
3. 客户仓只写：**业务页面、路由、鉴权门禁、品牌主题配置、部署**——不重写第二套登录/上传/Button。  
4. profile-v1 继续当**首个完整宿主与实战验证场**；能在 profile 跑通的 common 能力，默认视为「可外接到下一单」。

### 优先级总序（决策冲突时按此）

| 级 | 内容 | 说明 |
|----|------|------|
| **P0-北极星** | 能力可被**非 profile 宿主**直接引用 | API 宿主无关、文档可接、npm/子路径清晰、无 profile 私货硬编码 |
| **P0-执行** | Phase U：UI 统一到 sa2kit-ui + 复用 | 消除满天飞组件，否则外接项目仍会分叉 UI |
| **P1** | common 多端 entry / 鉴权契约 / 接入手册 | 方便下一单快速 bootstrap |
| **P2** | festivalCard 等多端业务试点 | 验证 business 模板 |
| **P3** | 功能优化、大域 S2、包体拆分 | 后移 |

任何「只在 profile 里好用、外接要大改」的改动，**违背北极星**，应拒绝或改成库内可配置方案。

### 设计推论（接单友好）

| 能力 | 外接要求 |
|------|----------|
| auth / file / config / aiApi | 经 env / bootstrap 注入；不绑死 profile 域名或密钥 |
| UI / 主题 | 实现在 sa2kit-ui；客户可换主题或加主题，不换组件库 |
| business 模块 | 可选依赖；客户可只用 common，不背实验田全家桶 |
| 文档 | 保持「新宿主接入清单」（安装 → 配 auth → 配 OSS → 引 UI → 第一页） |

profile-v1 内新增通用能力时：**默认落在 sa2kit / sa2kit-ui**，宿主只薄封装——这是北极星的日常执行方式。

---

## 0.1 架构方向摘要

### 已对齐的正确方向

1. **sa2kit = 可被多端同时引用的 SDK**，不是「只给 profile Web 用的工具包」。  
2. **common** 提供登录、OSS、配置、AI、UI/主题等通用能力，且同样按端拆分入口。  
3. **business 留在 sa2kit**：同一业务功能的 **Web UI / 后端 handler / RN / Taro** 实现放在同一业务模块下，避免每个宿主各写一套。  
4. **宿主变薄**：  
   - profile-v1 → 挂 Web 页 + API 路由 + 网关/部署（兼验证场）  
   - 未来付费项目 / RN / 小程序 / Electron → 同样只做壳，直引库  

### 相对旧表述的纠偏

| 原表述风险 | 优化后 |
|------------|--------|
| 「profile 整体引用 sa2kit」易被理解成只认 Web | 明确为：**按端选子路径**，同一包、不同 entry；**下一单客户仓同款引用** |
| 「business 迁回 profile」与「多端同仓」矛盾 | **撤销迁出战略**；`*-core` 视为过渡宿主域 |
| UI 直连 sa2kit-ui / animal-island | **设计系统在 sa2kit-ui**；经门面复用 |
| 能力写在 profile modules | **通用能力进库**，否则无法接单复用 |

---

## 1. 一句话蓝图

> **三仓一体 = 接单弹药库**：sa2kit 多端产品 SDK（common 基建 + business 可选域）；sa2kit-ui 唯一设计系统；profile-v1 与未来客户仓都是薄宿主。

```
                    ┌──────────────────────────────────────┐
                    │           sa2kit-ui                  │
                    │  tokens · themes · Button/Modal/…    │
                    │  @sa2kit-ui/{react,rn,taro,electron} │
                    └──────────────────▲───────────────────┘
                                       │ 依赖
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                              sa2kit（接单可复用 SDK）                          │
│  common/{auth,file,config,aiApi,ui,logger,…}/{web|server|rn|taro|…}          │
│  business/<feature>/{domain,server,ui/web,ui/rn,ui/taro,…}                   │
└───────────────┬──────────────────┬──────────────────┬───────────────────────┘
                │                  │                  │
     ┌──────────▼──────┐  ┌────────▼────────┐  ┌──────▼──────────┐
     │ profile-v1      │  │ 付费客户仓       │  │ RN / Taro /     │
     │ 验证场 + 自用站  │  │ 直引库即插即用   │  │ Electron 壳     │
     └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 2. 分层与目录约定（建议固化）

### 2.1 双层语义

| 层 | 可否依赖另一层 | 内容 |
|----|----------------|------|
| **common** | ❌ 禁止依赖 business | 鉴权、文件/OSS、配置、AI、日志、存储、请求、**UI/主题门面**、platform adapter |
| **business** | ✅ 只依赖 common（及同域内部） | 具体产品域：mmd、festivalCard、testYourself、未来可回灌的 calendar 等 |

继续用 ESLint：`common ↛ business`；`businessA ↛ businessB`（whitelist 除外）。

### 2.2 业务模块标准骨架（多端同仓）

```
src/business/<feature>/
  domain/           # 纯逻辑、类型、校验（无 React / 无 Node API）
  server/           # Next/Hono 可用的 route handlers、DbService、OSS 编排
  ui/
    app_web/            # React DOM（Next / Vite）
    rn/             # React Native / Expo
    taro/           # 微信·支付宝小程序
    electron/       # 可选：桌面专属；多数直接复用 web
  admin/            # 可选：管理端 UI（仍须宿主鉴权）
  index.ts          # 勿默认 barrel 全端；仅文档用
```

**npm 导出（示例）**

| 消费端 | 子路径 |
|--------|--------|
| Web 页面 | `sa2kit/business/<feature>/ui/web` |
| API 转发 | `sa2kit/business/<feature>/server` |
| RN | `sa2kit/business/<feature>/ui/rn` |
| 小程序 | `sa2kit/business/<feature>/ui/taro` |
| 共享类型/领域 | `sa2kit/business/<feature>/domain` |

common 同理，例如：

- `sa2kit/common/auth` / `…/server` / `…/rn`（已有雏形）  
- `sa2kit/common/ui` / `…/ui/rn` / `…/ui/taro` → 再导出对应 `@sa2kit-ui/*`  
- `sa2kit/common/file` / `…/server`

### 2.3 条件导出与包体

- **browser / node** 条件导出继续（避免 SSR 误打 OSS/postgres）。  
- **按端分包构建**：`build:common:web|server|rn|taro` + `build:business:*`，宿主只装到所需 entry，避免 32MB 全家桶拖垮小程序。  
- 中长期评估：**sa2kit 从「单包巨无霸」→「workspace 多包」**（`@sa2kit/common-auth`、`@sa2kit/biz-mmd`…），对外仍可用 `sa2kit/…` 聚合 exports；短期先把 **entry 切干净**。

---

## 3. 宿主职责矩阵

| 宿主 | 引用什么 | 自己写什么 | 不写什么 |
|------|----------|------------|----------|
| **profile-v1 Web / 子应用** | `common/*`、`business/*/ui/web`、`business/*/server` | 薄 `page.tsx`、`app/api/**` re-export、网关、实验田注册、部署 | 不复制业务 UI / DbService |
| **calendar-mobile / teach-hub-mobile** | `common/*/rn`、`business/*/ui/rn`、shared API client | 导航壳、原生权限、推送、cookie 同步 | 不手写第二套 Button/业务页（目标态） |
| **Taro 小程序**（可独立仓） | `common/*/taro`、`business/*/ui/taro` | app 配置、分包、发布 | 不复制 domain/server |
| **Electron 桌面** | 多数 `ui/web` + `common`；专属用 `ui/electron` | 窗口/自动更新 | 同左 |

### 鉴权契约（不变且必须写死）

- **会话实现**在 sa2kit `common/auth`。  
- **是否允许访问**由**宿主 route / 页面 Guard** 决定（`getApiSessionUser` / `isAdminRole`）。  
- 库内 admin UI **不自带**生产鉴权；文档与示例必须标明。

---

## 4. 与现状的关系（避免推倒重来）

### 4.1 已经做得对的

- `common/auth` 已有 `server` / `rn` / React 客户端拆分。  
- 部分 business 已有 `ui/web` + `server`（mmd、festivalCard、mikuContest、qqbot…）。  
- profile 子应用薄封装 + `*-core` cutover，证明「壳与实现分离」可行。  
- sa2kit-ui 已具备 react / rn / taro / electron 包结构。

### 4.2 需要纠偏的旧战略

| 旧说法（REFACTOR 2.0 / 上一版 TARGET） | 新蓝图 |
|----------------------------------------|--------|
| business 逐步迁回 profile-v1 | **business 留在 sa2kit，并补齐多端** |
| profile 是业务大本营 | profile 是 **Web/API 宿主大本营**；多端业务大本营是 sa2kit |
| 直接依赖 `@sa2kit-ui/react` / animal-island | 经 **`sa2kit/common/ui*`** |

### 4.3 已迁出的 `packages/*-core`（calendar / teach-hub / showmasterpiece）

**不建议立刻整包搬回 sa2kit**（成本高、与网关 cutover 冲突）。推荐三条并行策略：

| 策略 | 做法 | 适用 |
|------|------|------|
| **S1 冻结** | `*-core` 继续服务当前 Web/RN；新多端能力优先写在 sa2kit | 默认 |
| **S2 下沉** | 从 `*-core` 抽出 `domain` + `ui/rn` 等到 `sa2kit/business/<name>`，core 改为 re-export | 要开正式小程序/第二 RN 宿主时 |
| **S3 新域只进 sa2kit** | 新业务（含多端）禁止新建巨大 `*-core`，直接 `sa2kit/business/*` | 强制执行 |

**ideaList / fitnessPlan 等仍在 `app_web/web/src/modules` 的**：若明确要多端，再升格进 `sa2kit/business`；纯 Web 实验可暂留 modules。

---

## 5. UI / 主题在蓝图中的位置

```
sa2kit-ui（唯一组件与主题实现源）
  tokens · themes · 组件实现
  ThemeProvider → 按主题返回对应样式
  react | rn | taro | electron
         ▲ 逐步向外导出
sa2kit/common/ui/{web,rn,taro,electron}   ← 宿主/业务唯一推荐入口（门面）
         ▲
business/*/ui/* 与各宿主薄页面（编排，不造第二套基础件）
```

### 5.1 铁律（已拍板）

| 规则 | 说明 |
|------|------|
| **实现只在 sa2kit-ui** | 主题管理 + 对应 UI 样式/组件均在此仓；通用页面视觉统一走此库 |
| **相同功能 → 复用** | 已有 Button/Modal/Card… 直接复用；禁止在 profile / business / mobile `src/ui` 再造同功能件 |
| **新组件流程** | 先在 sa2kit-ui 实现 → 再经门面导出 → 宿主/业务才可引用 |
| **临时 UI 尽量不做** | 仅特殊要求可临时实现，必须登记债并限期回灌 sa2kit-ui |
| **库的后期职责** | sa2kit-ui **只做**：① 新增主题 + 主题下样式；② 新功能真正缺的新组件。不做同功能分叉 |

### 5.2 现有代码的统一化（本轮目标，非只防新增）

> **拍板（2026-08-29，已完成 2026-09-03）**：UI 实现只在 **sa2kit-ui**；消费经 **`sa2kit/common/ui*`** 门面；门禁 `pnpm gate:ui`。

| 来源 | 处置 |
|------|------|
| `animal-island-ui`（calendar / teach-hub） | 替换为门面后删除 |
| showmasterpiece-core（现 shadcn） | **强制**改 `sa2kit/common/ui` 动森件；缺件先补 sa2kit-ui |
| web webpack `animal-island` alias | 迁移后删除 |
| mobile 手写 `src/ui/*` | 改 `@sa2kit-ui/rn` / 门面；缺件升格进 ui |
| `sa2kit/common/components`（整包） | **迁入 ui 后清空**（含原「auth 壳 / 域面板 / 装饰件」的 UI 部分） |
| auth LoginModal 等 | **视觉进 sa2kit-ui**；hooks/session 留 `common/auth` |
| business 页内私有 Button/Modal/卡片 | 抽进 ui 或改用 ui；页只组装 |
| `@profile/ui` | **仅** Tailwind preset，不放业务组件 |

### 5.3 主题

- `ThemeProvider` + tokens：实现在 sa2kit-ui；经 `sa2kit/common/ui/theme`（名可变）再导出。  
- 切换主题 = 同一套组件 API，换 tokens / overlay 样式，而不是换另一套组件库。

---

## 6. 推荐包与版本策略

### 短期（1–2 个小版本）

- 保持单包 `sa2kit@3.x`，**强化子路径与平台 entry**。  
- sa2kit `package.json` 依赖 `@sa2kit-ui/react`（及 rn/taro 作 optional peer）。  
- profile pin 同一 major；RN/Taro 宿主同样 pin。

### 中期（可选）

- sa2kit 改为 monorepo 发包：`@sa2kit/common-*`、`@sa2kit/business-*`，根包做 re-export 兼容。  
- 与「小程序包体 / RN Metro」更合拍。

### 版本纪律

- **common**：semver 严格，breaking 需 migration 文档。  
- **business**：允许较快迭代，但 **同一 feature 的多端 API 尽量同版本对齐**（web 有的能力 rn 标明 supported / stub）。

---

## 7. 分阶段计划（蓝图执行）

> **优先级总序**：§0 北极星 > **Phase F（大域新域）** > 各域功能优化。  
> **已完成归档**（2026-09-03）：Phase A/B/U/C(festivalCard)/D/E1 — 见 [DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md)「已完成启明星阶段」；UI 门禁 `pnpm gate:ui`。  
> **Phase F / F1**（2026-09-04）：三域 `domain` + `PLATFORMS` + exports 已落地；**当前主线 F2 server**。

### Phase F — 大域下沉 `sa2kit/business/*`（**当前主线**）

| 域 | 计划 | 首步 |
|----|------|------|
| calendar | [docs/modules/calendar/DOMAIN-MIGRATION.md](../../modules/calendar/DOMAIN-MIGRATION.md) | C1 domain + PLATFORMS |
| teach-hub | [docs/modules/teach-hub/DOMAIN-MIGRATION.md](../../modules/teach-hub/DOMAIN-MIGRATION.md) | T1 domain + PLATFORMS |
| showmasterpiece | [docs/modules/showmasterpiece/DOMAIN-MIGRATION.md](../../modules/showmasterpiece/DOMAIN-MIGRATION.md) | M1 domain + server |

总览与 gates：[DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md)

**`*-core` 规则**：F1 起新功能只加 sa2kit business；core 仅 re-export，避免双轨。

---

## 8. 新功能开发检查清单（多端优先）

开新业务或给旧业务加端时：

1. [ ] 是否需要 **≥2 端**？是 → 建在 `sa2kit/business/<name>`，不要只写在 profile `modules/`。  
2. [ ] 先写 `domain/`（类型与规则），再写 `server/`，再写各 `ui/<platform>/`。  
3. [ ] UI 只用 `sa2kit/common/ui*`，不用 animal-island / 直连 sa2kit-ui。  
4. [ ] 每个 server handler 的鉴权在**宿主 re-export 层或 handler 入参约定**写清。  
5. [ ] 为缺失的端在 PLATFORMS.md 标 stub，而不是偷偷只实现 Web。  
6. [ ] profile 只加薄 page + `app/api` re-export + 实验田条目（如需）。

---

## 9. 风险与对策

| 风险 | 对策 |
|------|------|
| 单包过大，小程序/RN 难扛 | 强制子路径 + 按端构建；中期拆包 |
| business 成新单体 | 域间禁止互引；大域可独立 `@sa2kit/business-x` |
| 多端 API 漂移 | domain 共享 + PLATFORMS 矩阵 CI 检查导出存在性 |
| 与现有 `*-core` 双轨 | S1 冻结 + 新域只进 sa2kit；避免两边同时加功能 |
| admin / 上传无鉴权 | 宿主强制 Guard；库示例加醒目警告（CR SK-001/003） |

---

## 10. 成功标准（可验收）

**北极星（随时可用的判定）：**

0. 假设新建一个空的 Next/Expo 客户仓：能在文档步骤内接入 `sa2kit` 登录 + OSS + `sa2kit-ui` 主题/基础件，**无需**复制 profile 源码。  

**当前冲刺（Phase U）优先验收：**

1. 通用 UI：**实现只在 sa2kit-ui**；消费经门面；profile / core / mobile **无** animal-island、无同功能第二套基础件；§5.2 / Phase U0–U6 完成。  
2. sa2kit-ui 演进面清晰：日常交付 = **新主题** 与 **新功能确缺的新组件**；同功能直接复用。  

**其后（U 完成后再验收）：**

3. 新业务功能：sa2kit 内 `domain` + 至少 `ui/web` + `server`，且 PLATFORMS 声明其他端。  
4. 至少一条路径：`RN 宿主 import sa2kit/business/<x>/ui/rn` 最小页可跑。  
5. 登录与 OSS：仍只走 `sa2kit/common/auth|file`；bootstrap 文档对「非 profile 宿主」成立。  
6. 旧「business 迁出」文档全部改指向本蓝图。

---

## 11. 与旧 TARGET-ARCHITECTURE 的关系

| 文档 | 角色 |
|------|------|
| **本文件（BLUEPRINT）** | **现行推荐蓝图**（多端 SDK + business 留仓） |
| ~~TARGET-ARCHITECTURE.md~~ | 已删除；早期「通用面 + UI 门面」思路已并入本文；其中 **「business 迁回 profile」作废** |

确认本蓝图后建议：

1. 更新 `.cursor/KNOWLEDGE_BASE.md` §1.1。  
2. 在 sa2kit 仓新增 `docs/adr/00x-multiplatform-business-sdk.md`。

---

## 12. 已拍板事项（2026-08-29）

| # | 问题 | 决定 |
|---|------|------|
| 1 | calendar / teach-hub / showmasterpiece | **S1 冻结**（保留子应用 + `*-core`；新多端优先进 sa2kit；开正式小程序再评估 S2） |
| 2 | UI 是否只经 `sa2kit/common/ui*` | **是**（门面）；**实现只在 sa2kit-ui** |
| 3 | Phase C 试点 | 推荐 **festivalCard**（已有 app_web/server/miniapp 雏形）；修改清单见下节 |
| 4 | UI 组件策略 | **全部 UI 回签 sa2kit-ui**（含 auth 壳、域面板、装饰件、business 可拆件）；逻辑留 sa2kit；库后期 = 新主题 + 新缺组件 |
| 5 | 执行优先级 | **北极星（接单可复用）最高** → Phase U → 试点 / 功能优化后移 |
| 6 | 库 vs 宿主 | 通用能力进 sa2kit / sa2kit-ui；profile 与客户仓都是薄宿主 |
| 7 | showmasterpiece | **强制动森**（经 sa2kit-ui / 门面）；禁止继续 shadcn 轨 |

### 12.1 为何 S1：子应用的优点（相对「整包下沉 sa2kit」）

| 优点 | 说明 |
|------|------|
| **独立发布** | 日历/教学/画集可单独打 Docker 镜像、单独回滚，不必跟主站或 sa2kit npm 同发 |
| **构建隔离** | 单应用编译面更小；`ignoreBuildErrors` 等问题可按应用治理，不拖垮整个 SDK |
| **网关清晰** | `/calendar`、`/teach-hub`、`/showmasterpiece` + `/api/<域>` 已与 nginx/smoke 对齐 |
| **RN 已接线** | `*-shared` + mobile 已吃 core API；立刻 S2 等于重做一轮跨端契约 |
| **领域体量大** | showmasterpiece-core ~25k 行级；塞回 sa2kit 会再次胀包、拖累小程序/Metro |
| **宿主职责清晰** | 子应用 = 部署单元；sa2kit = 可复用 SDK。大域留在 core 并不违背「多端 SDK」——只是 **尚未下沉** |

**S2 何时值得**：出现「第二个非 profile 宿主必须复用同一业务 UI+API」（例如独立微信小程序要完整教辅），再抽 `domain` + `ui/taro` 下沉。

### 12.2 Phase C 试点（festivalCard）要改什么

现状：`app_web/`、`server/`、`miniapp/`、`components/` 等已有，但未对齐蓝图标准骨架与 UI 门面。

| 步骤 | 改动 | 验收 |
|------|------|------|
| C1 | 整理目录：抽出/对齐 `domain/`；`ui/web` ← 现有 web；`server` 保持；`miniapp` 归入或对齐 `ui/taro` 命名 | 目录符合蓝图 §2.2 |
| C2 | exports：稳定 `…/domain`、`…/server`、`…/ui/web`、`…/ui/taro`（或暂保留 miniapp 并文档映射） | profile 薄 page/api 仍能 import |
| C3 | UI：页面内组件改为经 `sa2kit/common/ui`（门面需 Phase B 先有；否则试点内先接 `@sa2kit-ui/react` 并登记债） | 无新增 animal-island |
| C4 | 宿主：`profile` 仅薄 `page` + `api/festivalCard` re-export；补 `PLATFORMS.md`（web ✅ / taro 部分 / rn stub） | 文档写明端状态 |
| C5 | （可选）最小 `ui/rn` stub 页，证明 RN 宿主能 import 子路径 | 编译通过即可 |
| C6 | admin/config 路由加 AuthGuard / `isAdminRole` | 关闭 SK-001 同类缺口 |

**不在试点范围**：把 calendar/teach-hub/showmasterpiece 搬进 sa2kit。  
**时机**：须在 **Phase U 验收后**再开；试点内 UI 只复用已统一组件。

---

## 13. 请你拍板的三个问题（历史）

已由 §12 关闭。若改选 testYourself 为试点，用其替换 §12.2 并优先补 admin 鉴权。
