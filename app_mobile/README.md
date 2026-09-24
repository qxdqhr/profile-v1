# mobile/

React Native 客户端，以 **git submodule** 挂入。只有 `calendar-mobile` / `teach-hub-mobile` 会在 `pnpm native:enable` 时进 workspace。

| 路径 | 子仓 | 包名 |
|------|------|------|
| `calendar-mobile/` | [profile-v1-calendar-mobile](https://github.com/qxdqhr/profile-v1-calendar-mobile) | `@profile/calendar-mobile` |
| `teach-hub-mobile/` | [profile-v1-teach-hub-mobile](https://github.com/qxdqhr/profile-v1-teach-hub-mobile) | `@profile/teach-hub-mobile` |
| `miku-to-you/` | [MikuToYou](https://github.com/qxdqhr/MikuToYou) | 仅挂载，不进 workspace |

私有 RN 仓（`profile_rn`、`shared_file_rn`）**不再挂 submodule**：CI 的 `GITHUB_TOKEN` 无法克隆私有仓，会拖垮打包。需要时在机子上单独 clone：

```bash
git clone git@github.com:qxdqhr/profile_rn.git ~/src/profile_rn
git clone git@github.com:qxdqhr/shared_file_rn.git ~/src/shared_file_rn
```

共享类型与 API 客户端：`sa2kit/business/calendar/domain`、`sa2kit/business/teachHub/domain`  
（亦可经 `sa2kit/business/*/ui/rn` stub 入口，其 re-export domain）。  
对应 Web：`app_web/calendar`、`app_web/teach-hub`。

```bash
# 1) 检出 submodule
git submodule update --init --recursive app_mobile

# 2) 把 native 写进 workspace 并装依赖（默认 workspace 不含 mobile）
pnpm native:enable
pnpm install

pnpm dev:calendar-mobile
pnpm build:calendar-mobile:android
```

计划：[`docs/monorepo-migration/APPS-SUBMODULE-PLAN.md`](../docs/monorepo-migration/APPS-SUBMODULE-PLAN.md)。
