# mobile/

React Native（Expo）客户端，以 **git submodule** 挂入。

| 路径 | 子仓 | 包名 |
|------|------|------|
| `calendar-mobile/` | [profile-v1-calendar-mobile](https://github.com/qxdqhr/profile-v1-calendar-mobile) | `@profile/calendar-mobile` |
| `teach-hub-mobile/` | [profile-v1-teach-hub-mobile](https://github.com/qxdqhr/profile-v1-teach-hub-mobile) | `@profile/teach-hub-mobile` |

共享类型：`@profile/calendar-core/shared`、`@profile/teach-hub-core/shared`。  
对应 Web：`web/calendar`、`web/teach-hub`。

```bash
git submodule update --init --recursive
pnpm install
pnpm dev:calendar-mobile
pnpm build:calendar-mobile:android
```

计划：[`docs/monorepo-migration/APPS-SUBMODULE-PLAN.md`](../docs/monorepo-migration/APPS-SUBMODULE-PLAN.md)。
