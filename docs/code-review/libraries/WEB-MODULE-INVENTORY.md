# 主站 Web 功能清单（启明星二期输入）

> **日期**：2026-09-13  
> **用途**：盘点 `app_web/web` 与已拆子应用，指导 Phase H 迁出与下一期继续拆分。  
> **分级定义**：见 [BLUEPRINT-multiplatform-sa2kit.md](./BLUEPRINT-multiplatform-sa2kit.md) §15.2  
> **更新约定**：每完成一次 A/B 迁出，改「分级/状态」列；新增路由必须登记一行。

## 图例

| 级 | 含义 |
|----|------|
| **A** | monorepo Next 子应用 + Docker/网关（API+DB+独立发版） |
| **B** | 下沉 `sa2kit/business/*`，薄 page |
| **C** | 留主站（壳 / 小 demo） |
| **S** | 已是独立子应用（`app_web/<app>`） |
| **L** | 已在 sa2kit，主站仅残留/转发 |
| **E** | 旁路/Godot/重 3D 优先，或明确后置 |

状态：`待迁` / `本期H1` / `已薄` / `已迁` / `非目标`

---

## 1. 已独立 Next 子应用（S）

| 应用 | basePath（生产） | 端口（dev 惯例） | 业务位置 | 状态 | 备注 |
|------|------------------|------------------|----------|------|------|
| calendar | `/calendar` | 3001 | `sa2kit/business/calendar` | 已薄 | S2 后置 |
| teach-hub | `/teach-hub` | 3002 | `sa2kit/business/teachHub` | 已薄 | S2 后置 |
| showmasterpiece | `/showmasterpiece` | 3003 | `sa2kit/business/showmasterpiece` | 已薄 | miniapp 在库内 |
| money-research | `/money-research` | 3004 | 宿主本地为主 | 已薄？ | H 期只验收厚度 |
| node-notes | `/node-notes` | 3005 | `sa2kit/business/nodeNotes` | 已薄 | |
| utilities | `/tools` | 3011 | `sa2kit/business/webTools/*` | 已薄 | H∞ 小工具壳；无 DB/API |

主站 `modules/showmasterpiece`、`testField/.../nodeNotes`、`ShowMasterPieces` 等应为重定向/薄兼容。主站 `/tools/*` → 302 `/tools/*`（nginx 同域反代 utilities）。

---

## 2. 本期 H1（A 类五件）

| 模块 | 主路由 | API | DB schema | 建议正式 basePath | 端口建议 | 顺序 | 状态 |
|------|--------|-----|-----------|-------------------|----------|------|------|
| ideaList | `/idea-list` | `/api/ideaLists` | sa2kit server schema | `/idea-list` | 3006 | 1 | **已迁 H1a** |
| filetransfer | `/filetransfer` | `/api/filetransfer` | sa2kit server schema | `/filetransfer` | 3007 | 2 | **已迁 H1b** |
| ticketMonitor | `/ticket-monitor` | `/api/ticket-monitor` | sa2kit server schema | `/ticket-monitor` | 3008 | 3 | **已迁 H1b** |
| fitnessPlan | `/fitness-plan` | `/api/fitnessPlan` | sa2kit server schema | `/fitness-plan` | 3009 | 4 | **已迁 H1c** |
| comfyPrompt | `/comfy-prompt` | `/api/comfyPrompt` | sa2kit server schema | `/comfy-prompt` | 3010 | 5 | **已迁 H1c** |

旧 testField 路径：302 → 正式路径；实验田卡片改外链。

---

## 3. `app_web/web/src/modules` 其余

| 模块 | 体量约 | API | DB | 建议级 | 状态 | 说明 |
|------|--------|-----|-----|--------|------|------|
| Home | 176K | `/api/homePage`, `homeContact` | — | C | 留主站 | 品牌首页 + 配置 |
| HomeV2 | 84K | — | — | C | 留主站 | 主题演示壳 |
| testField | 132K | — | — | C | 留主站 | 实验田目录 |
| exam | 薄 | `/api/exam` | sa2kit exam | L | 非目标 | 清残留即可 |
| games | 32K | — | — | C/E | 留主站 | 入口页；游戏走 Godot 旁路 |
| mmd | 168K | `/api/mmd` | `mmd` + sa2kit | B/E | 待迁 | 重 Three；可对 OPT-01 |
| solarSystem | 64K | — | — | E | 待迁 | 重 Three，后置 |
| mikutap | 440K | `/api/mikutap` | `mikutap` | E | 非目标 | 互动原型；Godot/旁路优先 |
| vocaloidBooth | 薄 | 主站 vocaloid-booth | `vocaloidBooth` | B | **已迁 B** | sa2kit/business/vocaloidBooth；正式 `/vocaloid-booth` |
| cardMaker | 80K | `/api/cardMaker` | `cardMaker` | B | **已迁 B** | sa2kit/business/cardMaker；正式 `/card-maker` |
| skillManager | 64K | `/api/skill-manager` | `skillManager` | B | **已迁 B** | sa2kit/business/skillManager；正式 `/skill-manager` |
| qrCode | 40K | — | — | B→webTools | **已迁 webTools** | `sa2kit/business/webTools/qrCode`；`/tools/qr-code` |
| dateCalculator | 36K | — | — | B→webTools | **已迁 webTools** | `sa2kit/business/webTools/dateCalculator`；`/tools/date-calculator` |
| workCalculate | — | — | — | B→webTools | **已迁 webTools** | `sa2kit/business/webTools/workCalculate`；`/tools/work-calculate` |
| imageDownloader | — | — | — | B→webTools | **已迁 webTools** | `sa2kit/business/webTools/imageDownloader`；`/tools/image-downloader`；代理 `/api/proxy-image` 留主站 |
| ticketBooking | 44K | — | — | C/B | 待迁 | 与画集预订相关，核对是否已由 SMP 覆盖 |
| notification | — | — | — | C | **已删** | H∞ 清 mock 实验页 |
| tailwindTest | 48K | 有 demo api | — | C | 留主站 | 样式实验 |
| filetransfer 等五件 | — | — | — | A | 见 §2 | |

---

## 4. 实验田 / examples 路由（无独立 modules 或跨模块）

> 下列按 URL 登记，便于下一期拆分；分级多为 C（demo）或 L（已在 sa2kit）。

| 路径 | 建议级 | 备注 |
|------|--------|------|
| `/testField` | C | 目录 |
| `/testField/experiment` (+ config) | L | exam |
| `/testField/FloatingMenuDemo` | C | UI demo |
| `/testField/LiveActivity` | C | |
| `/testField/SyncText` | C | `/api/syncText`；demo stub，后置 |
| `/testField/ImageDownloader` | B→webTools | **已薄** 302 → `/tools/image-downloader` |
| `/testField/WorkCalculate` | B→webTools | **已薄** 302 → `/tools/work-calculate` |
| `/tools/image-downloader` | B→webTools | sa2kit webTools 正式路径 |
| `/tools/work-calculate` | B→webTools | sa2kit webTools 正式路径 |
| `/testField/screenReceiver` | C/E | |
| `/testField/festivalCard` | L | sa2kit business |
| `/testField/mmd-test`, `mmdplaylist-test` | B/E | 随 mmd |
| `/testField/testYourself` | L | sa2kit |
| `/testField/mikuContest`, `mikuFireworks3D`, AR/VN 等 | L/E | 库内或 3D 后置 |
| `/testField/musicPlayer`, `xunfeiAsr` | C/B | |
| `/testField/ShowMasterPieces*` | S | → `/showmasterpiece` |
| `/testField/TicketBooking` | 核对 SMP | |
| `/testField/mikutap`, `playMusic` | E | |
| `/testField/Vocaloider*` | C/B | |
| `/testField/nodeNotes*` | S | → `/node-notes` |
| `/examples/*` | C | sa2kit/示例沙盒，不单拆镜像 |
| `/games` | C | 旁路入口 |
| `/homePage/config`, `/home/v2` | C | Home |
| `/vocaloid-booth*` | B | sa2kit vocaloidBooth；config 页已用 web |
| `/apk`, `/timestamp`, `/test-route` | C | 运维/探针 |

---

## 5. host/db 主站域表（迁出时跟随）

| schema 文件 | 关联功能 | 随哪次迁出 |
|-------------|----------|------------|
| ideaList.ts | ideaList | H1a |
| filetransfer.ts | filetransfer | H1b |
| ticketMonitor.ts | ticketMonitor | H1b |
| fitnessPlan.ts | fitnessPlan | H1c |
| comfyPrompt.ts | comfyPrompt | H1c |
| cardMaker.ts | cardMaker | H2（re-export sa2kit/server） |
| skillManager.ts | skillManager | H2（re-export sa2kit/server） |
| mikutap.ts | mikutap | E 后置 |
| mmd.ts | mmd | OPT-01 / B |
| vocaloidBooth.ts | vocaloidBooth | H∞（re-export sa2kit/server） |
| auth.ts | 全局 | 不迁出共享 |
| purchaseGame.ts / universalExport.ts | 游戏/导出 | 旁路或后置 |

已在 sa2kit server schema 的：calendar、teachHub、showmasterpiece、nodeNotes、exam、festivalCard、mmd（部分）、testYourself、mikuContest 等——以 `packages/sa2kit/src/business/*/server` 为准。

---

## 6. 下一期（H2）建议优先队列

在 H1 完成后，按价值从清单挑（需再过 A 门槛或改 B）：

1. ~~skillManager（API+DB）~~ ✅ H2（B）  
2. ~~cardMaker（API+DB）~~ ✅ H2（B）  
3. SyncText（API demo stub）— **C 后置**，不进 H2  
4. ~~qrCode + dateCalculator + WorkCalculate + ImageDownloader~~ ✅ `webTools`  
5. mmd / solarSystem（独立壳或 OPT-01）  
6. ~~vocaloidBooth~~ ✅ H∞（B 收口）

---

## 7. 修订记录

| 日期 | 变更 |
|------|------|
| 2026-09-13 | 初版：配合蓝图 §15 / grill 共识 |
| 2026-09-14 | H2：skillManager B；webTools 起步（qrCode + dateCalculator） |
| 2026-09-14 | H2 收口：webTools×4 + cardMaker B；SyncText 降 C 后置 |
| 2026-09-14 | H∞ 起步：`app_web/utilities` 壳（/tools · 3011） |
| 2026-09-14 | H∞：vocaloidBooth B 收口（schema+DbService+routes+宿主 UI） |
| 2026-09-14 | H∞：删除 notification mock 实验页 |
