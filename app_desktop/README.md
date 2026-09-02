# desktop/

桌面端客户端，以 **git submodule** 挂入。

| 路径 | 子仓 | 包名 |
|------|------|------|
| `teach-hub-desktop/` | [profile-v1-teach-hub-desktop](https://github.com/qxdqhr/profile-v1-teach-hub-desktop) | `@profile/teach-hub-desktop` |

共享类型：`@profile/teach-hub-core/shared`。对应 Web：`web/teach-hub`。

```bash
git submodule update --init --recursive
pnpm install
pnpm dev:teach-hub-desktop
```

计划：[`docs/monorepo-migration/APPS-SUBMODULE-PLAN.md`](../docs/monorepo-migration/APPS-SUBMODULE-PLAN.md)。
