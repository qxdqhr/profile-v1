# 客户仓最小依赖 vs profile 验证场

> 架构身份说明（Phase E）。配套：[ARCHITECTURE-REMEDIATION-PLAN.md](./ARCHITECTURE-REMEDIATION-PLAN.md)

## 两类用途

| 身份 | 是什么 | 怎么用 |
|------|--------|--------|
| **可复用弹药库** | `sa2kit` + `sa2kit-ui`（+ 可选单域 `*-core`） | 客户仓 `pnpm add` / link，只写业务页与部署 |
| **验证场宿主** | 本仓 `profile-v1` 整树 | 联调、实验田、网关、旁路（games / WP / mobile） |

**客户不需要、也不应** clone 整棵 profile-v1 来接单。

## 客户仓最小依赖集

1. `sa2kit` — auth / OSS / config / AI / UI 门面  
2. `@sa2kit-ui/*` — **仅经 sa2kit 门面**；客户一般不直连（RN 可 link `@sa2kit-ui/rn`）  
3. （可选）单域 `@profile/<domain>-core`（含 `./shared` 客户端类型与 API）或未来 `sa2kit/business/<domain>`

宿主只需：薄 page、API 路由挂载、鉴权门禁、主题配置、部署。

## profile 整仓职责

- 首个完整宿主与实战验证场  
- Monorepo 子应用矩阵、nginx 旁路、CI 镜像  
- 实验田与尚未迁出的主站模块  

新增**通用**能力默认进 sa2kit；新增**已迁出域**实现禁止再挂主站 API（`pnpm gate:architecture`）。

## 旁路隔离（不进客户最小集）

| 旁路 | 源码 | 基建 |
|------|------|------|
| Godot 游戏 | `app_games/<slug>/` submodule | `deploy/games/` |
| WordPress | `app_wordpress/<slug>/` submodule | `deploy/wordpress/` |
| Mobile / Desktop | `app_mobile/*` / `app_desktop/*` submodule | 各自 Expo / Electron |

旁路 URL（`/games/*`、`/wp/*`）须整页跳转，不可走 Next `<Link>` 到不存在的 App Router 路径。
