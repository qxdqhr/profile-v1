# 待定优化项目

> **状态：搁置。** 不要在普通任务里主动做这里的项。  
> **继续条件**：用户说 **「优化项目」**、**「继续优化」**、**「待定优化」**。  
> Agent：先读本文件与 skill `.cursor/skills/continue-optimization-backlog/SKILL.md`，从 **下一个未勾选项** 做一小步，做完勾选并改「下次从这里开始」。

来源：2026-09-02 架构审查里当时没排完、以及减负时明确后置的项。已完成的安全/鉴权/Dockerfile/游戏旁路见 [`2026-09-02-审查结果.md`](./2026-09-02-审查结果.md)。

**下次从这里开始：** `OPT-04`

---

## 队列

### OPT-01 Three / MMD 3D 迁出主站

主站曾直依 `three` / `three-stdlib` / `mmd-parser`。评估结论：**继续 `lazyClientPage` + 减依赖，不建独立 Next 壳**。3D 实现留在 sa2kit；宿主只薄 page + Next 分包配置。

- [x] 评估：独立 Next 壳 vs 继续 `lazyClientPage` + 减依赖 → 选后者
- [x] 落地：lighting demo → `sa2kit/business/mmd/demos`；`@profile/web` 去掉 `three` / `three-stdlib` / `mmd-parser` / `@types/three`；`next.config` 仍为传递依赖做 splitChunks

### OPT-02 裸奔写接口补 session

middleware 只认 cookie **是否存在**。伪造 `better-auth.session_token` 仍可能打到未调用 `getApiSessionUser` 的旧 handler。优先写操作（exam 配置、universal-file 等）。

- [x] 盘点 `app/api/**/route.ts` 无 session 的写方法
- [x] 切片：`universal-file` 写 + monitoring；exam `examTypes`/`questions` 写；`universal-export` 写 — `requireApiSession`
- [x] examples：calendar / test-configs / music 已有 `requireExampleAccess`；oss 已有 `requireOssExampleAdmin`；补 qqbot（webhook 除外）
- [x] 余公开面保持 allowlist：`auth/*`、`mikuFireworks3D/sync`、`homeContact`

### OPT-03 测试加厚

现在 `pnpm test` 只有几个 tsx verify，并进 `pnpm gate`。

- [x] 再补可离线跑的纯函数/allowlist/配置校验：`verify-is-admin-role`、`verify-write-api-session-gate`；allowlist 加 OPT-02 敏感写面断言
- [x] `turbo.json` 加 `test`（仅根包 `profile-v1`；`pnpm test:turbo`）；**不**把全仓 `tsc` 塞进 CI

### OPT-04 按域拆 schema / 解开 core 环

`@profile/db` 仍聚合全站表。业务 core 环已随 G3–G7 清零；schema 来自 `sa2kit/business/*/server`。

- [ ] 至少 calendar / teach-hub / 主站实验表分离方案
- [ ] 禁止新的 db→auth 直接依赖

### OPT-05 主站体验债

- [ ] `images.unoptimized: true` 是否还能关
- [ ] `viewport.userScalable: false` 无障碍
- [ ] web 上多余 `@radix-ui/*` vs sa2kit-ui；根 `components.json`

### OPT-06 仓库卫生

- [ ] 根 `dockerfile` 与 `app_web/web/Dockerfile` 重复
- [ ] `app_web/web/src/db`（`exam-service` 仍是活代码）收敛
- [ ] 根 `package.json` / `tsconfig` / workspace 含 mobile·desktop submodule 导致不 recursive clone 就 install 失败
- [ ] `app_games` submodule URL 混用 HTTPS/`git@`；clone 体验

### OPT-07 观测与 CI（低优先）

- [ ] 平台 nginx `depends_on: service_healthy`（曾故意不用，避免 web 慢启动拖垮整栈）
- [ ] 镜像 tag / 回滚策略；散落的 `gateway-fix*` workflow 是否还要

---

## 做完一项时

1. 把该项改成 `[x]`，必要时加一行「落地：commit / 要点」。
2. 把文首 **下次从这里开始** 改成下一未勾选 ID。
3. 不顺手改 Three（除非当前项就是 OPT-01）。
