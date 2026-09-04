# packages/

本仓 **唯一** 共享库目录（Phase G8）：仅两个 submodule。

| 包 | 路径 | 说明 |
|----|------|------|
| `sa2kit` | `sa2kit/` | 多端 SDK（business / common） |
| `@sa2kit-ui/*` | `sa2kit-ui/` | UI 设计系统 |

Profile 基建（auth / db / config / ui）在 `../host/`。  
**禁止**在 `packages/` 下新增第三共享包；见 `pnpm gate:architecture` 与蓝图 §14 G8。

主站：`app_web/web/`（`@profile/web`）。
