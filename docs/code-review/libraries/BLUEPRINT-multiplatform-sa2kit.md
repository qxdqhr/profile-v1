# 蓝图：多端 sa2kit SDK（common + business 同仓多端）

> 版本：v0.5 · 2026-09-04  
> 状态：**北极星执行中**（Phase F ✅ · **Phase G ✅ 完成**）— 见 §0 / §7 / **§14**  
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

> **优先级总序**：§0 北极星 > Phase G（**已完成**）> 各域产品优化 / 待定优化队列。  
> **已完成归档**（2026-09-03～04）：Phase A/B/U/C/D/E1/F — 见 [DOMAIN-MIGRATION-ROADMAP.md](./DOMAIN-MIGRATION-ROADMAP.md)。  
> **Phase F**（2026-09-04）：F1–F5 ✅。  
> **Phase G**：G1–G8 ✅（**完成**）。

### Phase F — 大域下沉 `sa2kit/business/*`（**已完成**）

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

> **历史注**：上表「不在试点范围」已被 **Phase F**（大域下沉）与 **§14 Phase G**（双库收敛）超越；保留原文仅作时间线。

---

## 13. 请你拍板的三个问题（历史）

已由 §12 关闭。若改选 testYourself 为试点，用其替换 §12.2 并优先补 admin 鉴权。

---

## 14. Phase G — 双库收敛（`packages/` 仅保留 sa2kit + sa2kit-ui）

> **状态**：**执行中** — G1–G8 ✅ · Phase G 完成（2026-09-04）  
> **目标**：profile-v1 的**共享库面**只剩两个 submodule：`packages/sa2kit`、`packages/sa2kit-ui`。其余 `@profile/*-core`、`@sa2kit/exam`、`sa2kit/common/feishu`、以及 `auth` / `db` / `config` / `ui` 基建薄包，全部并入 sa2kit（business / common）或收成**宿主本地**代码。  
> **关联**：Phase F 已完成 calendar / teachHub / showmasterpiece 的 domain·server·ui 主体下沉；本阶段清零剩余 facade 与仓内扩展包。  
> **包体纪律**：继续遵守 [PACKAGE-SPLIT-ROADMAP](../../packages/sa2kit/docs/PACKAGE-SPLIT-ROADMAP.md) —— 禁止客户仓 import `sa2kit` / `sa2kit/business` 聚合 barrel。

### 14.1 成功画面

| 项 | 达成后 |
|----|--------|
| `packages/` 共享库 | **仅** `sa2kit/`、`sa2kit-ui/`（git submodule） |
| 删除（或降级为宿主内联） | `sa2kit-exam`、`sa2kit-feishu`、`*-core`、`@profile/auth|db|config|ui` |
| 业务能力 | `sa2kit/business/{exam,teachHub,showmasterpiece,calendar,…}` |
| 飞书通知 | `sa2kit/common/feishu`（或 `common/notifications/feishu`） |
| 宿主 | `app_web/*`、`app_mobile/*`、`app_desktop/*` 只做：薄 page、API re-export、session/db/OSS **注入**、Docker/basePath |
| 客户仓 | `pnpm add sa2kit @sa2kit-ui/react`（按需）即可复用，无 `@profile/*` 共享依赖 |

### 14.2 现状盘点（2026-09-04）

| 包 | 约体积 | Phase F 后角色 | Phase G 处置 |
|----|--------|----------------|--------------|
| `@sa2kit/exam`（`packages/sa2kit-exam`） | ~0.8k 行 | 仓内扩展；schema 仍在 `@profile/db` | → `sa2kit/business/exam` |
| `sa2kit/common/feishu`（`packages/sa2kit-feishu`） | ~0.1k 行 | Webhook 工具；Home / ticketMonitor / CI 脚本在用 | → `sa2kit/common/feishu` |
| `@profile/teach-hub-core` | ~1.9k 行剩余 | Auth 壳 + hostRouteConfig + FileStore/generateLesson 宿主编排 | → business 补齐后 **删包**；编排留宿主或 `server/hostAdapters` 文档化 |
| `@profile/showmasterpiece-core` | ~2.9k 行剩余 | Auth 壳 + host route config + **miniapp** + rate-limit 等 | → business 补齐（含 `ui/miniapp` 或 `ui/taro`）后 **删包** |
| `@profile/calendar-core` | ~0.2MB 源 | Auth 壳 + 本地 export/import/recurrence/reminder + API 薄层 | → **同模式清零**（G5，与 TH/SMP 对齐） |
| `@profile/node-notes-core` | ~0.3MB | ✅ G7 | → `sa2kit/business/nodeNotes` |
| `@profile/auth` | 薄封装 | 已委托 `sa2kit/common/auth` | → 宿主 bootstrap；**删包**（G6） |
| `@profile/config` | YAML/SOPS | 与 `sa2kit/common/config` 重叠 | → common 能力 + 宿主路径注入；**删包**（G6） |
| `@profile/db` | schema 聚合 + 客户端 | 反向依赖多个 core / sa2kit server | → schema 已在各 `business/*/server`；宿主保留**本地** `drizzle` 客户端文件（非共享包）或 `app_web/web/src/db`（G6） |
| `@profile/ui` | Tailwind preset | 可被 sa2kit-ui / 宿主 preset 替代 | → **删包**（G6） |

> **明确范围**：你点名的首刀是 **exam + showmasterpiece-core + teach-hub-core + feishu**。calendar / node-notes / auth·db·config·ui 写入同一 Phase G，是因为「只剩两库」的终态离不开它们；可按 gate **分批合并**，不必一次 PR。

### 14.3 目标骨架（与 Phase F 一致）

```
sa2kit/
  common/feishu/          ← 原 sa2kit/common/feishu
  business/exam/
    domain/ | server/ | routes/ | ui/{web,rn,wechat,desktop}/ | PLATFORMS.md
  business/teachHub/      ← 补齐 core 残留（fileStore 工厂、generateLesson 宿主无关部分）
  business/showmasterpiece/
    … + ui/miniapp/       ← 原 core miniapp
  business/calendar/      ← 补齐本地 services + 删 core
  business/nodeNotes/     ← G7
```

宿主（示例 teach-hub）：

```
app_web/teach-hub/
  app/**/page.tsx          ← 直引 sa2kit/business/teachHub/ui/web
  app/api/**/route.ts      ← create*Handler + getSessionUser + db/OSS 注入
  lib/hostBootstrap.ts     ← 仅本应用：db、fileUrl、rateLimit 等
```

### 14.4 分阶段 gates

| Gate | 内容 | 验收 | 建议顺序 |
|------|------|------|----------|
| **G0** | 冻结扩面；本计划进蓝图；inventory 表冻结 | 文档 ✅；禁止新 `@profile/*` 共享包 | ✅ |
| **G1** | 飞书 → `sa2kit/common/feishu`；改 import；删 `sa2kit-feishu` | Home / ticketMonitor / CI 脚本绿；`pnpm --filter sa2kit build:common` | ✅ |
| **G2** | exam → `sa2kit/business/exam`（含 schema 从 `@profile/db` 迁入 `server`）；主站改引；删 `sa2kit-exam` | experiment / exam API 绿；`@profile/db` 只聚合 re-export 或移除 exam 表 | ✅ |
| **G3** | teach-hub-core **清零**：残留服务进 business；宿主直引 sa2kit；删包 | `@profile/teach-hub` build；mobile/desktop 已吃 domain（F4）无回归 | ✅ |
| **G4** | showmasterpiece-core **清零**：host config + miniapp 进 business；删包 | `@profile/showmasterpiece` build；miniapp 编译路径声明于 PLATFORMS | ✅ |
| **G5** | calendar-core **清零**（对齐 G3/G4） | calendar Web + mobile tsc | ✅ |
| **G6** | 基建迁出：`auth` / `config` / `db` / `ui` → `host/*` | packages/ 无四包；Docker/CI 已改 | ✅ |
| **G7** | node-notes-core → `business/nodeNotes`；删包 | node-notes 子应用 tsc | ✅ |
| **G8** | 收尾：`packages/README`、`pnpm-workspace`、tsconfig paths、KNOWLEDGE_BASE、architecture gate | `packages/` 仅两 submodule；CI gate 禁新建第三共享包 | ✅ |

### 14.5 各刀细节

#### G1 — Feishu → `sa2kit/common/feishu`

| 项 | 说明 |
|----|------|
| 迁入 | `sendFeishuPostMessage`、`buildFeishuPostMessage`、contact/ci 模板、`formatDateTime`、类型 |
| exports | `sa2kit/common/feishu`（server-safe；无 React） |
| 兼容 | 过渡 1 个小版本可留 `packages/sa2kit-feishu` 薄 re-export，或直接改消费者后删包 |
| 消费者 | `modules/Home`、`ticketMonitor`、`scripts/send-ci-feishu-notify.ts` |
| 禁区 | 不把 webhook URL / sign secret 写进库；继续由宿主 env 注入 |

#### G2 — Exam → `sa2kit/business/exam`

| 项 | 说明 |
|----|------|
| 映射 | 现 `core/` → `domain/`；`server/` → `server/` + `routes/`；`ui/*` → `ui/{web,rn,wechat,desktop}`；`services/` → `domain/client` 或 `ui/web/client` |
| schema | `host/db/src/schema/exam.ts` → `business/exam/server/schema.ts`；`@profile/db`（或宿主 db）聚合 `export *` |
| 宿主 | `app_web/web` 的 exam / experiment 改 `sa2kit/business/exam/*`；去掉 tsconfig `@sa2kit/exam` paths |
| PLATFORMS | web ✅ / server ✅ / rn·wechat·desktop 按现 Adapter 标状态 |
| UI | 经 `sa2kit/common/ui`；禁止新增第二套基础件 |

#### G3 — teach-hub-core 清零

| 残留（当前） | 去向 |
|--------------|------|
| `layout` Auth 壳 | 宿主 layout 或 `ui/web` 内可选 `withAuthShell` 文档；默认宿主自包 AuthProvider |
| `api/hostRouteConfig`、`_helpers` | **留宿主** `app_web/teach-hub/lib/`（注入 session/db/OSS） |
| `teachHubFileStore` / `generateLessonService` / `syncLessonResources` / persistence | 能无 profile 硬编码的进 `business/teachHub/server`；必须绑 profile 配置的留宿主 adapter |
| `shared` facade | 已 domain；删包后只保留 `sa2kit/business/teachHub/domain` |
| package | 删除 `@profile/teach-hub-core`；workspace / Docker 依赖改挂 sa2kit |

#### G4 — showmasterpiece-core 清零

| 残留（当前） | 去向 |
|--------------|------|
| `api/lib/*HostRouteConfig`、rateLimit、auth helper | **宿主** `app_web/showmasterpiece/lib/` |
| `ui/miniapp/**`、`service/miniapp` | `sa2kit/business/showmasterpiece/ui/miniapp`（或 `ui/taro` 命名对齐 festivalCard） |
| `useDeadlinePopupWechat` | 随 miniapp 或 `ui/web/client` |
| `initializeShowmasterpieceDb` | 宿主 bootstrap 调用 sa2kit server 工厂 |
| package | 删除 `@profile/showmasterpiece-core` |

#### G5 — calendar-core 清零

| 残留 | 去向 |
|------|------|
| export/import/recurrence/reminder services | `business/calendar/domain` 或 `server`（按是否需 Node API） |
| Auth 壳 pages | 同 G3：宿主或文档化壳 |
| API re-export | 宿主 `app/api` 已直连 sa2kit routes 的保持；删 core 中转 |

#### G6 — 基建四包消融（最敏感）

| 包 | 策略 |
|----|------|
| `@profile/auth` | 宿主 `createAuth` / `AuthProvider` 直接调 `sa2kit/common/auth`；主站挂 `/api/auth` 不变 |
| `@profile/config` | 加载 YAML/SOPS 的「profile 路径约定」进宿主 `lib/config`；通用解析留 `sa2kit/common/config` |
| `@profile/db` | **不再作为共享包**：各 app 或 monorepo 根保留 `src/db/client.ts` + `schema/index.ts`（仅聚合 `sa2kit/business/*/server` schema）；migrate 脚本改指该路径 |
| `@profile/ui` | Tailwind preset 迁到宿主或 `@sa2kit-ui/*` 文档推荐 preset |

风险：全仓 import 面大，须 **codemod + CI 禁回归**；建议 G6 单独里程碑，可先 G1–G5。

#### G7 — node-notes ✅

按 Phase F 模板落地：`domain` → `server/routes` → `ui/web`；宿主 `app_web/node-notes/lib`；已删 `node-notes-core`。

#### G8 — 仓库门禁

- `pnpm-workspace.yaml`：`packages/*` 实际只解析两 submodule（或显式列出）。  
- architecture gate：禁止新增 `packages/<new-shared>`。  
- 更新：`packages/README.md`、`.cursor/KNOWLEDGE_BASE.md`、`docs/AGENTS.md`、本蓝图 §0.1 示意。

### 14.6 非目标（本阶段不做）

- 把 `app_web/*` 子应用合并回主站（部署单元保持）。  
- 强制实现 showmasterpiece / teachHub **原生 RN UI**（继续 stub + domain）。  
- sa2kit npm 拆成 `@sa2kit/biz-*` 多包发布（仍按 PACKAGE-SPLIT 中期；本阶段只做**目录与依赖收敛**）。  
- WordPress / Godot games 旁路迁入 sa2kit。

### 14.7 执行约定（确认后遵守）

1. **先 sa2kit 仓 commit/push → 再 bump profile submodule → 再改宿主/删包**。  
2. 每 gate 独立可回滚；G1/G2 可当日合并，G3–G5 按域，G6 单独窗口。  
3. 每刀后：相关 `pnpm --filter <app> build` 或 `tsc --noEmit`；sa2kit `build:business` / `build:common`；必要时 `measure:dist`。  
4. 删除包前：grep 清零旧包名；更新 tsconfig paths。  
5. **确认前不改代码**——仅文档；你回复确认范围（例如「先 G1–G4」或「G1–G8 全做」）后再动手。

### 14.8 待你确认的问题

| # | 问题 | 默认建议 |
|---|------|----------|
| Q1 | G5 calendar-core、G7 node-notes 是否纳入本轮？ | **纳入同一 Phase G**，但可排在 G3/G4 之后 |
| Q2 | G6 auth/db/config/ui 是否本轮必做？ | **本轮做完才算「只剩两库」**；若只求「业务扩展进 sa2kit」，可先停在 G5 |
| Q3 | feishu 子路径名 | 推荐 `sa2kit/common/feishu` |
| Q4 | exam schema 是否立即迁出 `@profile/db` | **是**（与 festivalCard/calendar 一致） |
| Q5 | showmasterpiece miniapp 目录名 | 推荐 `ui/miniapp`（保留现名）或对齐为 `ui/taro`——执行前再定 |

---

**确认口令（示例）**：`确认 Phase G：G1–G4` 或 `确认 Phase G：G1–G8`。确认前 **不执行**迁移。
