# Godot 小游戏双轨迁移计划

## 策略（已变更）

1. **先全量最简 Godot**：每个目标游戏在 `games/<slug>/` 做可玩的最简版并旁路上线 `/games/<slug>/`。
2. **原版先保留**：`/testField/...` 的 Phaser/Next 实现与实验田主卡片**不删**，继续作为正式游玩入口。
3. **全部最简迁完后**：再逐个对照原版整理逻辑、美术与体验，然后才切主入口 / 删旧实现。

禁止在「尚未全量最简迁完」阶段删除游戏相关 `testField` page/module（Field 非游戏工具本就不在范围内）。

## 双轨入口约定

| 角色 | 路径 | experimentData |
|------|------|----------------|
| 正式入口（原版） | `/testField/<Name>` | 原 `id`，`isCompleted` 维持原状 |
| Godot 最简（并行） | `/games/<slug>/` | 另开 `id: "<slug>-godot"`，标题带「Godot 最简」，`isCompleted: false` 直至精修完成 |

## 阶段

| 阶段 | 内容 | 完成标准 |
|------|------|----------|
| A 基建 | 通用导出脚本、CI、ADD-GAME | 已完成 |
| B 最简全覆盖 | 每款目标游戏一份 Godot MVP + 旁路 | 清单全部有 `/games/<slug>/` 且可玩 |
| C 逐个精修 | 对齐原版玩法/手感/存档，再切主入口 | 单游戏评审通过后再删旧路由 |

## 目标清单（阶段 B）

随实验田 leisure 游戏增减；`pulse-parade` 为原生 Godot，无旧版可删。

| slug | 原版路径 | Godot 状态 |
|------|----------|------------|
| pulse-parade | —（原生） | 已上线 |
| flappy-wish | `/testField/flappyWish`（旧保留） | **阶段 C 精修完成**；主入口 `/games/flappy-wish/` |
| suika-game | `/testField/suikaGame`（旧保留） | **阶段 C 精修完成**；主入口 `/games/suika-game/` |
| bubble-shooter | `/testField/bubbleShooter`（旧保留） | **阶段 C 精修完成**；主入口 `/games/bubble-shooter/` |
| arknights-bubble-shooter | `/testField/arknightsBubbleShooter`（旧保留） | **阶段 C 精修完成**；主入口 `/games/arknights-bubble-shooter/` |
| miku-flick | `/testField/mikuFlick`（旧保留） | **阶段 C 精修完成**；主入口 `/games/miku-flick/` |
| huarongdao | `/testField/huarongdao`（旧保留） | **阶段 C 精修完成**；主入口 `/games/huarongdao/` |
| push-box | `/testField/pushBox`（旧保留） | **阶段 C 精修完成**；主入口 `/games/push-box/` |
| gold-miner | `/testField/goldMiner`（旧保留） | **阶段 C 精修完成**；主入口 `/games/gold-miner/` |
| miku-fusion-game | `/testField/mikuFusionGame`（旧保留） | **阶段 C 精修完成**；主入口 `/games/miku-fusion-game/` |
| link-game | `/testField/linkGame` | 最简已上线；原版双轨 |
| race-game | `/testField/raceGame` | 最简已上线；原版双轨 |
| trible-game | `/testField/tribleGame` | 最简已上线；原版双轨 |
| miku-click | `/testField/MikuClick` | 最简已上线；原版双轨 |
| kannot | `/testField/Kannot` | 最简已上线；原版双轨 |
| vocaloid-to-go | `/testField/VocaloidtoGO` | 最简已上线；原版双轨 |
| purchase-game | `/purchaseGame` | 最简已上线；原版双轨 |
| mikutap-game | `/mikutapGame` | 最简已上线；原版双轨 |
| miku-planting | `/testField/mikuPlanting` | 最简已上线；原版双轨 |

### leisure 待迁 backlog（实验田 `category: leisure`）

| 原版 id / 路径 | 建议 slug | 优先级 | 备注 |
|----------------|-----------|--------|------|
| linkGame_v1 | — | 跳过 | 主版已迁 link-game |
| miku-fireworks-3D | — | 暂缓 | 3D 烟花 |
| festivalCard | — | 暂缓 | Three.js 贺卡 |
| solarSystem | — | 暂缓 | 3D 天文 |
| mikutap | — | 暂缓 | 音乐互动+配置（工具态，另有 mikutap-game） |
| miku-talking | — | 暂缓 | MMD 3D |
| playMusic / Vocaloider / ShareMonitor | — | 暂缓 | 播放器/工具 |
| mmdViewer | — | 暂缓 | 3D 查看器 |
| show-master-pieces / TicketBooking | — | 暂缓 | 展览/票务非典型小游戏 |

**阶段 B（2D/小游戏向）已收口**，可进入阶段 C 逐个精修。

阶段 B 只要求：**核心循环可玩**（开始/操作/计分或胜负），不要求美术与原版一致。

## 阶段 C 门槛（单游戏）

- [ ] 手感/难度曲线与原版可接受对齐
- [ ] 实验田主卡片 `path` 切到 `/games/<slug>/`
- [ ] 删除对应 testField 游戏 page/module 与仅该游戏使用的静态资源
- [ ] 移除或合并 `-godot` 副卡片


## 阶段 C 进度

| slug | 手感对齐 | 主入口已切 | 旧路由已删 | 副卡片已合并 |
|------|----------|------------|------------|--------------|
| pulse-parade | n/a（原生） | 已是主入口 | — | — |
| flappy-wish | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| suika-game | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| bubble-shooter | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| arknights-bubble-shooter | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| miku-flick | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| huarongdao | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| push-box | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| gold-miner | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| miku-fusion-game | ✅ | ✅ | ⏳ 旧 page 暂留 | ✅ |
| （后续按清单顺序） | | | | |
