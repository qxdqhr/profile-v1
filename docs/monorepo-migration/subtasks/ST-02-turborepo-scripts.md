# ST-02 Turborepo 与根脚本约定

**任务 ID**：M-02  
**状态**：done  
**依赖**：M-01

## 目标

引入 `turbo` 统一多包 `build` / `lint` / `dev`，并在根 `package.json` 定义过滤器脚本。

## 交付物

- [x] `turbo.json`（pipeline: build, lint, dev）
- [x] 根 `package.json` scripts：
  - `dev:web` → `turbo run dev --filter=personal-website`
  - `dev:calendar` / `dev:teach-hub`（占位，ST-10 / ST-14 前 exit 1）
  - `build:web` / `build:all`
- [x] `devDependency`: `turbo`

## `turbo.json`

见仓库根 `turbo.json`。

## 端口约定（本地）

| 应用 | 端口 | `NEXT_DIST_DIR` |
|------|------|-----------------|
| web | 3000 | `.next` |
| calendar | 3001 | `.next-calendar` |
| teach-hub | 3002 | `.next-teach-hub` |

已写入 [ARCHITECTURE.md](../ARCHITECTURE.md) §10。

## 验收记录（2026-06-11）

1. `pnpm turbo run build --dry-run` 无配置错误
2. `pnpm turbo run build --filter=personal-website --dry-run` 命中根包
3. `build:all` 仅对有 `build` script 的包执行（sa2kit 无 build 则跳过）
4. ST-07 完成后将 `personal-website` 过滤器改为 `@profile/web`

## 备注

与现有 `dev:3002` 脚本冲突时，以 monorepo 端口表为准；teach-hub 正式占用 3002，遗留脚本在 ST-07 收敛。
