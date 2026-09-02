# Web / Mobile / Desktop 目录拆分 + Submodule 迁移计划

> **状态**：阶段 0–1 已执行；阶段 2（desktop）待执行  
> **日期**：2026-09-02  
> **参照模式**：[`deploy/games/`](../../deploy/games/README.md)、[`deploy/wordpress/`](../../deploy/wordpress/README.md)

## 0. 已确认事项

| # | 结论 |
|---|------|
| 1 | 顶层：`apps/` **改名为 `web/`**；RN → **`mobile/`**；桌面 → **`desktop/`** |
| 2 | 执行顺序：**先移动端，再桌面端** |
| 3 | 子仓命名：`qxdqhr/profile-v1-*`（与 games 一致） |
| 4 | 新增顶层 **`npm/`** 放置 `*-shared` 包 |
| 5 | **Next 子应用暂不外迁** |

## 进度

| 阶段 | 状态 | 说明 |
|------|------|------|
| 0 目录重排 | ✅ | `apps`→`web/`，`*-shared`→`npm/`，config 软链 |
| 1 Mobile submodule | ✅ | `mobile/calendar-mobile`、`mobile/teach-hub-mobile` |
| 2 Desktop submodule | ⬜ | `web/teach-hub-desktop` → `desktop/` |
| 3 文档收尾 | 进行中 | KNOWLEDGE_BASE / README |

## 当前目录结构

```
profile-v1/
├── web/                          # 原 apps/（Next.js Web 矩阵）
│   ├── web/                      # 主站
│   ├── calendar/
│   ├── teach-hub/
│   ├── showmasterpiece/
│   ├── money-research/
│   ├── node-notes/
│   └── teach-hub-desktop/        # 阶段 2 迁出
├── mobile/                       # RN submodule ✅
│   ├── calendar-mobile/          # → profile-v1-calendar-mobile
│   └── teach-hub-mobile/         # → profile-v1-teach-hub-mobile
├── npm/                          # ✅ calendar-shared / teach-hub-shared
├── packages/                     # auth / db / *-core
├── games/                        # 旁路（不动）
└── wordpress/                    # 旁路（不动）
```

## 阶段 2 预览（desktop）

```bash
gh repo create qxdqhr/profile-v1-teach-hub-desktop --public
git subtree split --prefix=web/teach-hub-desktop -b split/teach-hub-desktop
git push git@github.com:qxdqhr/profile-v1-teach-hub-desktop.git split/teach-hub-desktop:main
git rm -rf web/teach-hub-desktop
git submodule add git@github.com:qxdqhr/profile-v1-teach-hub-desktop.git desktop/teach-hub-desktop
# 更新 pnpm-workspace：加入 desktop/*；改根脚本路径
```

## Workspace

```yaml
packages:
  - '.'
  - 'web/*'
  - 'packages/*'
  - 'npm/*'
  - 'mobile/*'
  # 阶段 2 后：'desktop/*'
```
