# profile-v1 分模块 Code Review

> 目录：`docs/code-review/`  
> 目标：对 Monorepo 全项目按模块建立可追踪的 Code Review 文档，并持续推进修复。  
> 架构约定 SSOT：`.cursor/KNOWLEDGE_BASE.md`  
> 启动轮次：2026-08-29

**全仓架构审查（2026-09-02，已落地快照）**：[2026-09-02-审查结果.md](./2026-09-02-审查结果.md)  
**待定优化（搁置；用户说「优化项目」时接着做）**：[PENDING-OPTIMIZATION.md](./PENDING-OPTIMIZATION.md)

---

## 1. 怎么用

| 文件 | 用途 |
|------|------|
| [TEMPLATE.md](./TEMPLATE.md) | 单模块 CR 报告模板（新开评审请复制） |
| [CROSS-CUTTING.md](./CROSS-CUTTING.md) | 跨模块共性问题与全局债务 |
| [libraries/](./libraries/) | 外部库 CR；**蓝图** [BLUEPRINT-multiplatform-sa2kit.md](./libraries/BLUEPRINT-multiplatform-sa2kit.md) |
| `packages/*.md` | 共享基建包评审 |
| `modules/*.md` | 主站 `app_web/web/src/modules/*` 评审 |
| `app_web/*.md` | 子应用 / 壳层评审 |

**状态图例**

| 状态 | 含义 |
|------|------|
| ⬜ pending | 尚未评审 |
| 🔄 in-progress | 评审进行中 |
| ✅ reviewed | 本轮文档已落地，待跟进修复 |
| 🛠️ fixing | 已开修，部分问题关闭中 |
| ✔️ closed | 本轮关键项已关闭或接受风险 |

严重度：`P0` 阻断/安全/确定性 bug → `P1` 高优先 → `P2` 中 → `P3` 低/文档债。

---

## 2. 评审范围与分层

```
外部库   sa2kit (common/business)  ·  sa2kit-ui (@sa2kit-ui/react)
        ↓ 薄封装 / 直接依赖
共享基建 packages/{config,db,auth,ui}
        ↓
领域 core  packages/{calendar,teach-hub,showmasterpiece,node-notes}-core (+ shared)
        ↓
应用壳   app_web/{web,calendar,teach-hub,showmasterpiece,...}
        ↓
主站模块 app_web/web/src/modules/*（实验田 + 业务）
```

评审时对照：

1. KNOWLEDGE_BASE 模块/API/实验田约定  
2. 鉴权与数据面（session、admin、公开读）  
3. 类型与构建闸门（`ignoreBuildErrors` 等）  
4. cutover 残留（web 双挂载、legacy re-export）

---

## 3. 进度总表

### 3.0 外部维护库（兄弟仓）

| 库 | 本地路径 | 状态 | 报告 |
|----|----------|------|------|
| sa2kit | submodule `packages/sa2kit/` | ✅ | [libraries/sa2kit.md](./libraries/sa2kit.md) |
| sa2kit-ui / `@sa2kit-ui/react` | submodule `packages/sa2kit-ui/` | ✅ | [libraries/sa2kit-ui.md](./libraries/sa2kit-ui.md) |
| 索引 | — | — | [libraries/README.md](./libraries/README.md) |

### 3.1 共享包 `packages/*`

| 模块 | 规模（约） | 状态 | 报告 |
|------|------------|------|------|
| `@profile/config` | 5 文件 / ~110 行 | ✅ | [packages/config.md](./packages/config.md) |
| `@profile/db` | 5 文件 / ~336 行 + schema 聚合 | ✅ | [packages/db.md](./packages/db.md) |
| `@profile/auth` | 6 文件 / ~148 行 | ✅ | [packages/auth.md](./packages/auth.md) |
| `@profile/ui` | preset only | ✅ | [packages/ui.md](./packages/ui.md) |
| `calendar-core`（含 `/shared`） | ~12.8k | ✅（应用视角） | [apps/calendar.md](./apps/calendar.md) |
| `teach-hub-core`（含 `/shared`） | ~7.4k | ✅（应用视角） | [apps/teach-hub.md](./apps/teach-hub.md) |
| `showmasterpiece-core` | ~24.8k | ✅（应用视角） | [apps/showmasterpiece.md](./apps/showmasterpiece.md) |
| `node-notes-core` | ~3.7k | ⬜ | — |
| `sa2kit-exam` / `sa2kit-feishu` | 小 | ⬜ | — |

### 3.2 子应用 `app_web/*`

| 应用 | 状态 | 报告 |
|------|------|------|
| `web`（边界与主站职责） | ✅ | [app_web/web-overview.md](./app_web/web-overview.md) |
| `calendar` | ✅ | [apps/calendar.md](./apps/calendar.md) |
| `teach-hub` | ✅ | [apps/teach-hub.md](./apps/teach-hub.md) |
| `showmasterpiece` | ✅ | [apps/showmasterpiece.md](./apps/showmasterpiece.md) |
| `calendar-mobile` / `teach-hub-mobile` | ⬜ | — |
| `node-notes` / `money-research` / `teach-hub-desktop` | ⬜ | — |

### 3.3 主站模块 `app_web/web/src/modules/*`（按代码量优先）

| 模块 | 约行数 | 类型 | 状态 | 报告 |
|------|--------|------|------|------|
| ideaList | 4.1k | DB+API（参考模板） | ✅ | [modules/ideaList.md](./modules/ideaList.md) |
| mikutap | 10.3k | 游戏/音游 | ⬜ | — |
| fitnessPlan | 7.7k | DB+业务 | ⬜ | — |
| comfyPrompt | 5.3k | 工具/API | ⬜ | — |
| mmd | 3.8k | 3D/OSS | ⬜ | — |
| filetransfer | 3.0k | 工具/API | ⬜ | — |
| Home / HomeV2 | 2.9k / 1.0k | 首页 | ⬜ | — |
| ticketMonitor | 2.9k | 监控 | ⬜ | — |
| testField | 2.3k | 实验田壳 | ⬜ | — |
| purchaseGame | 1.9k | 游戏 | ⬜ | — |
| skillManager | 1.3k | 工具 | ⬜ | — |
| solarSystem | 1.3k | 可视化 | ⬜ | — |
| cardMaker | 1.2k | 工具 | ⬜ | — |
| flappyWish / bubbleShooter 等 Phaser 页 | — | 已迁 Godot，主站已删 | ✔️ | 见 `deploy/games/` |
| aiApi | 0.5k | AI 转发 | ⬜ | — |
| dateCalculator / qrCode | 工具 | 工具 | ⬜ | — |
| ticketBooking / notification / huarongdao / vocaloidBooth / exam / tailwindTest | 小 | 杂项 | ⬜ | — |
| showmasterpiece | ~13 行 re-export | legacy | 见 apps 报告 | — |
| nodeNotes | 薄壳 | 已迁 core | ⬜ | — |

---

## 4. 本轮（2026-08-29）结论摘要

### 必须优先处理（跨切 P0/P1）

1. **ideaList Next.js 15 `params` 未 await** — 清单更新/删除与 toggle 可能直接坏掉（见 modules/ideaList.md）。  
2. **showmasterpiece API 双挂载** — `app_web/web/src/app/api/showmasterpiece/**` 与子应用并存，易 drift（见 app_web/showmasterpiece.md）。  
3. **DB `sslMode` 配置被忽略** — `packages/db` 硬编码 `ssl: false`（见 packages/db.md）。  
4. **全站 `typescript.ignoreBuildErrors: true`** — web + 三子应用 + 其他 app，类型错误可进镜像（见 CROSS-CUTTING.md）。  
5. **sa2kit**：`UserMenu` role 大小写错误；`testYourself` admin 示例无鉴权（见 libraries/sa2kit.md）。  
6. **sa2kit-ui**：主站 alias vs 子应用 `animal-island-ui` 双轨；全主题 CSS ~1.3MB（见 libraries/sa2kit-ui.md）。

### 架构健康点

- cutover 后 calendar / teach-hub 主站模块与 API 已摘除，边界清晰。  
- ideaList 仍是「含 DB 模块」目录与 API re-export 的可复制模板（修复 P0 后更适合当范本）。  
- Auth 统一走 `@profile/auth` + 同域 cookie；网关 `/api/auth/*` → web。  
- sa2kit common 条件导出 + profile 薄封装；HomeV2 对 `@sa2kit-ui/react` 集成较规范。

---

## 5. 建议下一批评审 / 修复顺序

1. 落地 sa2kit / sa2kit-ui P0（跨仓：role、admin 门禁、UI 依赖统一）  
2. `fitnessPlan`、`comfyPrompt`、`filetransfer`（有 DB/API，安全面大）  
3. `mmd` + OSS 路径与上传链路（大量 `sa2kit/business/mmd`）  
4. `mikutap`（体量大，分 api/db/ui 子报告）  
5. `node-notes-core` + `app_web/node-notes`（对照 `docs/node-notes` 需求）  
6. RN 三端（cookie 同步、API base URL；评估接 `@sa2kit-ui/rn`）  
7. 小游戏走 Godot 旁路；主站减负余项见 [PENDING-OPTIMIZATION.md](./PENDING-OPTIMIZATION.md)（不要在普通任务里主动做）

---

## 6. 变更本目录的时机

- 完成或关闭某一模块 CR → 更新对应报告状态与本 README 进度表  
- 新增 `app_web/*` / `packages/*` / 主站模块 → 追加清单条目  
- 跨切修复落地 → 更新 [CROSS-CUTTING.md](./CROSS-CUTTING.md)
