# ST-16 teach-hub 入口切换与兼容

**任务 ID**：M-16  
**状态**：done  
**依赖**：M-15

## 目标

用户入口迁至 teach-hub 子应用，清理 web 遗留。

## 交付物

- [x] 产品 URL：`/teach-hub` → 302 至子应用（`NEXT_PUBLIC_TEACH_HUB_URL`，默认 `http://localhost:3002`）
- [x] `experimentData.ts` path 更新为 `/teach-hub`
- [x] web 内 `/testField/teachHub/**` catch-all 302
- [x] 删除 web 内 `src/modules/teachHub` 与 `/api/teach-hub`
- [x] 移除 web 对 `@profile/teach-hub-core` 依赖

## 兼容策略

**重定向（B 阶段）**：`apps/web/src/lib/teach-hub-app-url.ts`，与 calendar 一致。

## 验收记录（2026-06-17）

1. 实验田入口 `/teach-hub` 可用（重定向至子应用）
2. 旧书签 `/testField/teachHub/w/...` 保留路径片段重定向
3. web `.next` 构建产物不含 `TEACH_SKILL_SYSTEM_PROMPT`

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_TEACH_HUB_URL` | `http://localhost:3002` | web 重定向目标（子应用根 URL） |
| `NEXT_PUBLIC_TEACH_HUB_BASE_URL` | `''`（子应用内） | 子应用站内路由前缀 |

## 后续（ST-17）

多 Dockerfile 与 CI matrix。
