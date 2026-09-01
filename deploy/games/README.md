# Godot / 静态小游戏旁路（非 Next 子应用）

路径命名空间：`/games/<slug>/`。

**迁移策略见 [GODOT-REWRITE-PLAN.md](./GODOT-REWRITE-PLAN.md)（双轨：原版保留 → 全量最简 Godot → 再逐个精修）。**

已上线：

| slug | 说明 |
|------|------|
| `pulse-parade` | Pulse Parade（节奏点按 MVP，原生 Godot） |
| `flappy-wish` | 予愿飞翔 Godot 最简（原版 `/testField/flappyWish`） |
| `suika-game` | 合成大西瓜 Godot 最简（原版 `/testField/suikaGame`） |
| `bubble-shooter` | 泡泡龙 Godot 最简（原版 `/testField/bubbleShooter`） |
| `arknights-bubble-shooter` | 岁家龙泡泡 Godot 最简（原版 `/testField/arknightsBubbleShooter`） |
| `miku-flick` | Miku Flick Godot 最简（原版 `/testField/mikuFlick`） |
| `huarongdao` | 华容道 Godot 最简（原版 `/testField/huarongdao`） |
| `push-box` | 推箱子 Godot 最简（原版 `/testField/pushBox`） |
| `gold-miner` | 黄金矿工 Godot 最简（原版 `/testField/goldMiner`） |
| `miku-fusion-game` | Miku Fusion Godot 最简（原版 `/testField/mikuFusionGame`） |

## 架构

| 层 | 路径 |
|---|---|
| 源码 | `games/<slug>/`（Godot 工程） |
| 旁路静态站 | `deploy/games/<slug>/`（nginx.conf + CI 生成的 `www/`） |
| 网关 | `/games/<slug>/` → `game_<slug>`（下划线） |

- **game_\<slug\>**：`nginx:alpine`，挂载 `deploy/games/<slug>/www/`
- **`www/` 不进 git**，由 Actions `export-godot-games` 导出后 artifact → `deploy-web` scp
- **不进** pnpm / Next Docker matrix
- **阶段 B**：上线 Godot 最简时**保留** testField 原版；仅阶段 C 精修通过后才删游戏路由

## URL

| 游戏 | Godot | 原版（若有） |
|------|-------|--------------|
| Pulse Parade | `/games/pulse-parade/` | — |
| 予愿飞翔 | `/games/flappy-wish/` | `/testField/flappyWish` |
| 合成大西瓜 | `/games/suika-game/` | `/testField/suikaGame` |
| 泡泡龙 | `/games/bubble-shooter/` | `/testField/bubbleShooter` |
| 岁家龙泡泡 | `/games/arknights-bubble-shooter/` | `/testField/arknightsBubbleShooter` |
| Miku Flick | `/games/miku-flick/` | `/testField/mikuFlick` |
| 华容道 | `/games/huarongdao/` | `/testField/huarongdao` |
| 推箱子 | `/games/push-box/` | `/testField/pushBox` |
| 黄金矿工 | `/games/gold-miner/` | `/testField/goldMiner` |
| Miku Fusion | `/games/miku-fusion-game/` | `/testField/mikuFusionGame` |

## 开发流

1. 改 `games/<slug>/**`，push `main`
2. CI：安装 Godot 4.7.1 → Web 导出全部 `games/*/project.godot` → 旁路部署 + smoke
3. 本地预览：`godot --path games/<slug>`
4. 本地导出：`bash scripts/export-godot-game.sh <slug>` 或 `bash scripts/export-all-godot-games.sh`

## 加游戏

见 [ADD-GAME.md](./ADD-GAME.md)。
