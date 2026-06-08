# profile-v1 × sa2kit 2.0 迁移清单

> 对应 sa2kit 侧 SSOT：[../sa2kit/docs/REFACTOR_2.0_BACKLOG.md](../sa2kit/docs/REFACTOR_2.0_BACKLOG.md)（任务 R2-006）  
> 本文件追踪 profile-v1 作为 **首个 2.0 consumer** 的改造项。

## 版本策略

| 阶段 | profile-v1 依赖 | 说明 |
|------|-----------------|------|
| 联调期 | `"sa2kit": "file:../sa2kit"` | 本地 alpha 联调 |
| alpha 稳定后 | `"sa2kit": "^2.0.0-alpha.0"` | 锁定 alpha 范围 |
| 2.0 stable | `"sa2kit": "^2.0.0"` | 生产可用 |

> **sa2kit 本地联调**：`pnpm install` 默认仅构建 common（`prepare → build:common`）。需要 business subpath 时在 sa2kit 目录执行 `SA2KIT_WITH_BUSINESS=1 pnpm install` 或 `pnpm build`。

## 迁移任务

| ID | 任务 | sa2kit 对应 | 状态 |
|----|------|-------------|------|
| PV2-001 | showmasterpiece 完全本地化，不再 import `sa2kit/showmasterpiece` | R2-401 | ✅ |
| PV2-002 | 文件链路统一 `sa2kit/common/file` | R2-501 | ✅ |
| PV2-007 | 移除 globalThis，使用 `fileUrl.ts` 显式解析器 | R2-203 | ✅ |
| PV2-003 | 删除 `src/types/sa2kit.d.ts` 中 file 相关过度兜底 | R2-502 | ✅ |
| PV2-004 | universal-file API routes 使用 ossFile bootstrap | R2-205 | ✅ |
| PV2-005 | skill-manager / fitnessPlan / vocaloidBooth 走 common/file | R2-504 | ✅ |
| PV2-006 | 创建 `docs/sa2kit-2.0-migration.md` 与 smoke 扩展 | R2-506 | ✅ |

## import 替换对照（目标）

| 旧 (1.x) | 新 (2.0 common) |
|----------|-----------------|
| `sa2kit/universalFile` | `sa2kit/common/file` |
| `sa2kit/universalFile/server` | `sa2kit/common/file/server` |
| `sa2kit/ossFile` | `sa2kit/common/file` |
| `sa2kit/ossFile/server` | `sa2kit/common/file/server` |
| `sa2kit/logger` | `sa2kit/common/logger` |
| `sa2kit/showmasterpiece/*` | `@/modules/showmasterpiece`（本地模块） |

## 验收

- [x] `rg 'sa2kit/universalFile' src/` 为零（docs 除外）
- [x] `rg 'sa2kit/showmasterpiece' src/` 为零（docs 除外）
- [x] `rg 'sa2kit/ossFile' src/` 为零（统一 common/file）
- [ ] smoke 脚本覆盖 universal-file 上传/下载
