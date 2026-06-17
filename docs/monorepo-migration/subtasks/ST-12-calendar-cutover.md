# ST-12 calendar 入口切换与兼容

**任务 ID**：M-12  
**状态**：done  
**依赖**：M-11

## 目标

将用户入口切到 calendar 子应用，web 保留兼容跳转或反代。

## 交付物

- [x] 产品路径：`/calendar` 或独立子域（见 ST-18）
- [x] `apps/web`：删除或 302 旧 `/testField/calendar`
- [x] `experimentData.ts` 更新 path 指向新 URL
- [x] 删除 `apps/web` 内 `src/modules/calendar` 兼容层
- [x] 删除 `apps/web` 内 `/api/calendar`（若 API 已迁至 calendar app）

## 兼容策略（二选一）

| 策略 | 说明 |
|------|------|
| **反代** | Nginx `/api/calendar` → calendar upstream |
| **重定向** | web 仅 302 到 calendar 域名 |

**本次采用**：重定向（B 阶段）。`apps/web/src/lib/calendar-app-url.ts` + `NEXT_PUBLIC_CALENDAR_URL`（默认 `http://localhost:3001`）。

## 验收标准

1. 实验田入口可用
2. `pnpm --filter @profile/web build` 不再编译 calendar 模块
3. web 构建体积/时间下降（记录 build log 对比）

## 文档

- 更新 `packages/calendar-core/README.md` 安装与部署说明
