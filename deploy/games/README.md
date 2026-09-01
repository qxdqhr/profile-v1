# Godot / 静态小游戏旁路（非 Next 子应用）

路径命名空间：`/games/<slug>/`。

已上线：

| slug | 说明 |
|------|------|
| `pulse-parade` | Pulse Parade（节奏点按 MVP） |
| `flappy-wish` | 予愿飞翔（竖版 Flappy，Godot 重写） |

## 架构

| 层 | 路径 |
|---|---|
| 源码 | `games/<slug>/`（Godot 工程） |
| 旁路静态站 | `deploy/games/<slug>/`（nginx.conf + CI 生成的 `www/`） |
| 网关 | `/games/<slug>/` → `game_<slug>`（下划线） |

- **game_\<slug\>**：`nginx:alpine`，挂载 `deploy/games/<slug>/www/`
- **`www/` 不进 git**，由 Actions `export-godot-games` 导出后 artifact → `deploy-web` scp
- **不进** pnpm / Next Docker matrix
- 旧 Phaser/Next 游戏上线 Godot 版后：**删除**对应 `testField` page/module（仅游戏；Field 工具不动）

## URL

| 游戏 | 游玩 |
|------|------|
| Pulse Parade | `https://<host>/games/pulse-parade/` |
| 予愿飞翔 | `https://<host>/games/flappy-wish/` |

## 开发流

1. 改 `games/<slug>/**`，push `main`
2. CI：安装 Godot 4.7.1 → Web 导出全部 `games/*/project.godot` → 旁路部署 + smoke
3. 本地预览：`godot --path games/<slug>`
4. 本地导出：`bash scripts/export-godot-game.sh <slug>` 或 `bash scripts/export-all-godot-games.sh`

## 加游戏

见 [ADD-GAME.md](./ADD-GAME.md)。
