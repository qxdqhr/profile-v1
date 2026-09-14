# `@profile/db` schema 分域方案（OPT-04）

> 状态：方案 + 域桶落地；**不**改变表结构 / 迁移目录。  
> 包路径：`host/db`（包名仍为 `@profile/db`）。

## 目标

1. 聚合入口可按域引用，避免「一切都从 `schema/index` 心智」。
2. **calendar / teach-hub**（及已迁出产品域）明确：真相在 `sa2kit/business/*/server`，宿主只聚合。
3. **主站实验表**单独成桶，后续迁出不搅乱产品域。
4. **禁止** `@profile/db` → `@profile/auth`（鉴权应依赖 db schema，方向相反）。

## 现状（2026-09-14）

| 域桶 | 入口 | 内容 |
|------|------|------|
| platform | `@profile/db/schema/domains/platform` | Better Auth 宿主扩展表（`schema/auth.ts`） |
| product | `@profile/db/schema/domains/product` | calendar、teachHub、showmasterpiece、nodeNotes、festivalCard、universal file |
| webExperiments | `@profile/db/schema/domains/webExperiments` | mikutap、exam、ideaList、fitness、mmd、cardMaker、skillManager、comfyPrompt、ticketMonitor、vocaloidBooth、filetransfer、purchaseGame、universalExport |
| 全量 | `@profile/db/schema` | 上三者 re-export（migrate 仍用全量） |

`core` 业务环已随 G3–G7 清零；本项只处理 **schema 聚合面**。

## calendar / teach-hub

| 项 | 约定 |
|----|------|
| 表定义 | `sa2kit/business/calendar/server`、`sa2kit/business/teachHub/server` |
| 子应用运行时 | 可直引 sa2kit server schema；不必经过 `@profile/db` |
| 主站 / 统一 migrate | 经 `domains/product` 进入全量聚合 |
| 不要做 | 在 `host/db` 再复制一份表定义 |

## 主站实验表

优先继续留在 `webExperiments`；单模块迁入 sa2kit 后，把对应 `export * from '../…'` 改成 `sa2kit/business/…/server`，并从本地文件删除。

## db → auth

- `@profile/db` **不得**依赖 `@profile/auth`（`package.json` + 源码 import）。
- `@profile/auth` → `@profile/db`（读 schema）允许。
- 门禁：`scripts/verify-db-no-auth-dep.ts`（进 `pnpm test`）。

## 后续切片（未做）

- [ ] 子应用 drizzle 配置改为只挂 `domains/product`（或单域），缩短 introspect 面
- [ ] 实验表逐个迁 sa2kit 后从 `webExperiments` 删除本地文件
- [ ] 评估 platform auth 表是否部分回灌 sa2kit common/auth schema（Better Auth issuer 扩展仍宿主优先）
