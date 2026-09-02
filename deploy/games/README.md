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
| `link-game` | 连连看 Godot 最简（原版 `/testField/linkGame`） |
| `race-game` | 赛车 Godot 最简（原版 `/testField/raceGame`） |
| `trible-game` | 三消 Godot 最简（原版 `/testField/tribleGame`） |
| `miku-click` | 米库点击 Godot 最简（原版 `/testField/MikuClick`） |
| `kannot` | 坎诺特 Godot 最简（原版 `/testField/Kannot`） |
| `vocaloid-to-go` | 博立格来冲 Godot 最简（原版 `/testField/VocaloidtoGO`） |
| `purchase-game` | 购买挑战 Godot 最简（原版 `/purchaseGame`） |
| `mikutap-game` | MikutapGame Godot 最简（原版 `/mikutapGame`） |
| `miku-planting` | 米库种植 Godot 最简（原版 `/testField/mikuPlanting`） |
| `diner-dash` | 罗德厨房（submodule `diner-dash-clone`；Spine 预构建 Web） |

## 架构

| 层 | 路径 |
|---|---|
| 源码 | `app_games/<slug>/`（**git submodule**，独立仓） |
| 旁路静态站 | `deploy/games/<slug>/www/`（CI 生成） |
| 网关 | `/games/<slug>/` → 平台 nginx alias `/var/www/games/<slug>/www/` |

- **平台 nginx**：挂载整个 `deploy/games/`，一条正则 location 覆盖全部 slug（小写 + 连字符）
- **`www/` 不进 git**，由 Actions `export-godot-games` 导出后 artifact → `deploy-web` scp
- **加载**：Godot 4.7 单线程 wasm 约 38MB；导出脚本预压 `.gz`，平台 nginx `gzip_static` 直出（见 `scripts/compress-godot-www.sh`）
- **不进** pnpm / Next Docker matrix；**不再**为每游戏起 `nginx:alpine` 容器
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
| 连连看 | `/games/link-game/` | `/testField/linkGame` |
| 赛车 | `/games/race-game/` | `/testField/raceGame` |
| 三消 | `/games/trible-game/` | `/testField/tribleGame` |

## 开发流

1. 改 `app_games/<slug>/**`，push `main`
2. CI：安装 Godot 4.7.1 → Web 导出全部 `app_games/*/project.godot` → 旁路部署 + smoke
3. 本地预览：`godot --path app_games/<slug>`
4. 本地导出：`bash scripts/export-godot-game.sh <slug>` 或 `bash scripts/export-all-godot-games.sh`

## 加游戏

见 [ADD-GAME.md](./ADD-GAME.md)。
