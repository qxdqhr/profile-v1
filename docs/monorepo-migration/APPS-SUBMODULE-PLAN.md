# Web / Mobile / Desktop 目录拆分 + Submodule 迁移计划

> **状态**：阶段 0–2 已执行完成  
> **日期**：2026-09-02  
> **参照模式**：[`deploy/games/`](../../deploy/games/README.md)、[`deploy/wordpress/`](../../deploy/wordpress/README.md)

## 0. 已确认事项

| # | 结论 |
|---|------|
| 1 | 顶层：`apps/` → `web/`；RN → `mobile/`；桌面 → `desktop/` |
| 2 | 顺序：先移动端，再桌面端 |
| 3 | 子仓：`qxdqhr/profile-v1-*` |
| 4 | `npm/` 放置 `*-shared` |
| 5 | Next 子应用暂不外迁 |

## 进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 0 目录重排 | ✅ | `apps`→`web/`，`*-shared`→`npm/` |
| 1 Mobile submodule | ✅ | `mobile/calendar-mobile`、`mobile/teach-hub-mobile` |
| 2 Desktop submodule | ✅ | `desktop/teach-hub-desktop` |
| 3 文档收尾 | ✅ | 本文件与 KNOWLEDGE_BASE |

## 最终目录结构

```
profile-v1/
├── web/                 # Next.js Web 矩阵
│   ├── web/
│   ├── calendar/
│   ├── teach-hub/
│   ├── showmasterpiece/
│   ├── money-research/
│   └── node-notes/
├── mobile/              # RN submodule
│   ├── calendar-mobile/          → profile-v1-calendar-mobile
│   └── teach-hub-mobile/         → profile-v1-teach-hub-mobile
├── desktop/             # Electron submodule
│   └── teach-hub-desktop/        → profile-v1-teach-hub-desktop
├── npm/                 # calendar-shared / teach-hub-shared
├── packages/            # auth / db / *-core
├── games/               # 旁路（不动）
└── wordpress/           # 旁路（不动）
```

## Workspace

```yaml
packages:
  - '.'
  - 'web/*'
  - 'packages/*'
  - 'npm/*'
  - 'mobile/*'
  - 'desktop/*'
```

## 子仓清单

| 父仓路径 | GitHub |
|----------|--------|
| `mobile/calendar-mobile` | https://github.com/qxdqhr/profile-v1-calendar-mobile |
| `mobile/teach-hub-mobile` | https://github.com/qxdqhr/profile-v1-teach-hub-mobile |
| `desktop/teach-hub-desktop` | https://github.com/qxdqhr/profile-v1-teach-hub-desktop |
