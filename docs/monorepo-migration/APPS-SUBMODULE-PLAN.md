# Web / Mobile / Desktop 目录拆分 + Submodule 迁移计划

> **状态**：阶段 0–2 已执行完成  
> **日期**：2026-09-02  
> **参照模式**：[`deploy/games/`](../../deploy/games/README.md)、[`deploy/wordpress/`](../../deploy/wordpress/README.md)

## 0. 已确认事项

| # | 结论 |
|---|------|
| 1 | 顶层：`apps/` → `app_web/`；RN → `app_mobile/`；桌面 → `app_desktop/` |
| 2 | 顺序：先移动端，再桌面端 |
| 3 | 子仓：`qxdqhr/profile-v1-*` |
| 4 | `npm/` 曾放 `*-shared`（已并入 `*-core/shared`） |
| 5 | Next 子应用暂不外迁 |

## 进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 0 目录重排 | ✅ | `apps`→`app_web/`，`*-shared`→`npm/`（后并入 core） |
| 1 Mobile submodule | ✅ | `app_mobile/calendar-mobile`、`app_mobile/teach-hub-mobile` |
| 2 Desktop submodule | ✅ | `app_desktop/teach-hub-desktop` |
| 3 文档收尾 | ✅ | 本文件与 KNOWLEDGE_BASE |

## 最终目录结构

```
profile-v1/
├── app_web/                 # Next.js Web 矩阵
│   ├── app_web/
│   ├── calendar/
│   ├── teach-hub/
│   ├── showmasterpiece/
│   ├── money-research/
│   └── node-notes/
├── app_mobile/              # RN submodule
│   ├── calendar-mobile/          → profile-v1-calendar-mobile
│   └── teach-hub-mobile/         → profile-v1-teach-hub-mobile
├── app_desktop/             # Electron submodule
│   └── teach-hub-desktop/        → profile-v1-teach-hub-desktop
├── npm/                 # 历史 *-shared（已空）
├── packages/            # auth / db / *-core（含 ./shared）
├── app_games/               # 旁路（不动）
└── app_wordpress/           # 旁路（不动）
```

## Workspace

```yaml
packages:
  - '.'
  - 'app_web/*'
  - 'packages/*'
  - 'npm/*'
  - 'app_mobile/*'
  - 'app_desktop/*'
```

## 子仓清单

| 父仓路径 | GitHub |
|----------|--------|
| `app_mobile/calendar-mobile` | https://github.com/qxdqhr/profile-v1-calendar-mobile |
| `app_mobile/teach-hub-mobile` | https://github.com/qxdqhr/profile-v1-teach-hub-mobile |
| `app_desktop/teach-hub-desktop` | https://github.com/qxdqhr/profile-v1-teach-hub-desktop |
