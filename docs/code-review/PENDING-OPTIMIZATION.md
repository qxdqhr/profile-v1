# 待定优化项目

> **状态：搁置。** 不要在普通任务里主动做这里的项。  
> **继续条件**：用户说 **「优化项目」**、**「继续优化」**、**「待定优化」**。  
> Agent：先读本文件与 skill `.cursor/skills/continue-optimization-backlog/SKILL.md`，从 **下一个未勾选项** 做一小步，做完勾选并改「下次从这里开始」。

来源：2026-09-02 架构审查里当时没排完、以及减负时明确后置的项。已完成的安全/鉴权/Dockerfile/游戏旁路见 [`2026-09-02-审查结果.md`](./2026-09-02-审查结果.md)。

**下次从这里开始：** `OPT-02`（OPT-01 Three 额外搁置，除非用户点名 3D/MMD 迁出）

---

## 队列

### OPT-01 Three / MMD 3D 迁出主站

主站仍依赖 `three` / `three-stdlib` / `mmd-parser`（太阳系、MMD、烟花、AR 等）。**比其它优化更后置**——说「优化项目」时跳过本项，除非用户明确要拆 3D。做的时候：按路由继续拆包或独立壳，不要把 three 打回首页。

- [ ] 评估：独立 Next 壳 vs 继续 `lazyClientPage` + 减依赖
- [ ] 落地并更新本清单

### OPT-02 裸奔写接口补 session

middleware 只认 cookie **是否存在**。伪造 `better-auth.session_token` 仍可能打到未调用 `getApiSessionUser` 的旧 handler。优先写操作（exam 配置、syncText、universal-file 等）。

- [ ] 盘点 `app/api/**/route.ts` 无 session 的写方法
- [ ] 逐个 `requireApiSession`（公开面保持 allowlist）

### OPT-03 测试加厚

现在 `pnpm test` 只有几个 tsx verify，并进 `pnpm gate`。

- [ ] 再补可离线跑的纯函数/allowlist/配置校验
- [ ] 视情况给 `turbo.json` 加 test；主站全仓 `tsc` 仍有既有错误，不要贸然进 CI

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
