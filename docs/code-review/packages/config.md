# CR — `@profile/config`

| 项 | 内容 |
|----|------|
| 路径 | `packages/config/` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed |

---

## 范围

- `src/init.ts` — `ensureAppConfigLoaded` 单例  
- `src/preload.ts` — `tsx --import` 入口  
- `src/apply-ai-env.ts` — YAML `ai` → `process.env`  
- `src/repo-root.ts` — 向上找 `pnpm-workspace.yaml`  
- 配置实体目录：`config/*.yaml`（包外）

---

## 发现项

| ID | 严重度 | 标题 | 建议 | 状态 |
|----|--------|------|------|------|
| CFG-001 | P2 | `init.ts` 与 `preload.ts` 重复 load + applyAi | 抽共享 `bootstrapOnce()` | open |
| CFG-002 | P2 | 敏感项在 YAML，依赖 SOPS 运维纪律 | 保持；CR 时核对 example 不含真密钥 | open（流程） |
| CFG-003 | P3 | `scripts/preload-app-config.ts` 已 deprecated | 全仓改引用后删除 | open |

---

## 优点

- monorepo 根解析适配 Docker standalone `cwd`  
- `setEnvIfEmpty` 避免覆盖已有 AI env  
- 包边界清晰，加载委托 sa2kit bootstrap

---

## 跟进

- [ ] 合并 init/preload 重复逻辑  
- [ ] 审计脚本是否仍引用 deprecated preload
