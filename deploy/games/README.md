# Godot / 静态小游戏旁路（非 Next 子应用）

路径命名空间：`/games/<slug>/`。首期：**`pulse-parade`**（Pulse Parade，Godot 4 Web 单线程）。

## 架构

| 层 | 路径 |
|---|---|
| 源码 | `games/pulse-parade/`（Godot 工程） |
| 旁路静态站 | `deploy/games/pulse-parade/`（nginx.conf + CI 生成的 `www/`） |
| 网关 | `/games/pulse-parade/` → `game_pulse_parade` |

- **game_\<slug\>**：`nginx:alpine`，挂载 `deploy/games/<slug>/www/`
- **`www/` 不进 git**，由 Actions `export-pulse-parade-web` 导出后 artifact → `deploy-web` scp
- **不进** pnpm / Next Docker matrix

## URL

| | |
|---|---|
| 游玩 | `https://<host>/games/pulse-parade/` |

## 开发流

1. 改 `games/pulse-parade/**`，push `main`
2. CI：安装 Godot 4.7.1 → Web 导出 → 旁路部署 + smoke
3. 本地预览：`godot --path games/pulse-parade`
4. 本地导出：`games/pulse-parade/scripts/sync-web-to-deploy.sh` 或 `scripts/export-pulse-parade-web.sh`

## 加游戏

见 [ADD-GAME.md](./ADD-GAME.md)。
