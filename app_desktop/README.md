# desktop/

桌面端客户端，以 **git submodule** 挂入。

| 路径 | 子仓 | 包名 |
|------|------|------|
| `teach-hub-desktop/` | [profile-v1-teach-hub-desktop](https://github.com/qxdqhr/profile-v1-teach-hub-desktop) | `@profile/teach-hub-desktop` |
| `lan-drop/` | [profile-v1-lan-drop](https://github.com/qxdqhr/profile-v1-lan-drop) | `@profile/lan-drop` |
| `cursor-skills-manager/` | [cursor-skills-manager](https://github.com/qxdqhr/cursor-skills-manager) | 仅挂载（Web + API + Electron），不进 workspace |
| `talking-tool/` | [talkingTool](https://github.com/qxdqhr/talkingTool) | 仅挂载。仓内同时有 Electron、Expo 与同步服务，整仓挂在桌面端 |

共享类型：`sa2kit/business/teachHub/domain`。对应 Web：`web/teach-hub`。

LanDrop（局域网发现 + 互传）需求：[`docs/modules/lan-drop/REQUIREMENTS.md`](../docs/modules/lan-drop/REQUIREMENTS.md)。

```bash
# 1) 检出 submodule
git submodule update --init --recursive app_desktop

# 2) 把 native 写进 workspace 并装依赖（默认 workspace 不含 desktop）
pnpm native:enable
pnpm install

pnpm dev:teach-hub-desktop
pnpm dev:lan-drop
```

计划：[`docs/monorepo-migration/APPS-SUBMODULE-PLAN.md`](../docs/monorepo-migration/APPS-SUBMODULE-PLAN.md)。
