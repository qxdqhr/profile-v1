# packages/

本仓共享库 / 弹药库旁路目录（Phase G8）。

| 条目 | 路径 | 说明 |
|------|------|------|
| `sa2kit` | `sa2kit/` | 多端 SDK（business / common）；**pnpm workspace** |
| `@sa2kit-ui/*` | `sa2kit-ui/` | UI 设计系统；**pnpm workspace** |
| `sa2kit-skill` | `sa2kit-skill/` | Cursor Agent Skills 集合；**非** npm / **不进** workspace |

Profile 基建（auth / db / config / ui）在 `../host/`。  
**禁止**在 `packages/` 下再增第三共享 **npm** 包；Agent skill 请放进 `sa2kit-skill`。见 `pnpm gate:architecture` 与蓝图 §14 G8。

主站：`app_web/web/`（`@profile/web`）。
