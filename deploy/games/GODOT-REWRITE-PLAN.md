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
| flappy-wish | `/testField/flappyWish` | 最简已上线；原版双轨 |
| suika-game | `/testField/suikaGame` | 最简已上线；原版双轨 |
| bubble-shooter | `/testField/bubbleShooter` | 最简已上线；原版双轨 |
| arknights-bubble-shooter | `/testField/arknightsBubbleShooter` | 最简已上线；原版双轨 |
| miku-flick | `/testField/mikuFlick` | 最简已上线；原版双轨 |
| huarongdao | `/testField/huarongdao` | 最简已上线；原版双轨 |
| push-box | `/testField/pushBox` | 最简已上线（3 关 MVP）；原版双轨 |
| gold-miner | `/testField/goldMiner` | 最简已上线；原版双轨 |
| miku-fusion-game | `/testField/mikuFusionGame` | 最简已上线；原版双轨 |

### leisure 待迁 backlog（实验田 `category: leisure`）

| 原版 id / 路径 | 建议 slug | 优先级 | 备注 |
|----------------|-----------|--------|------|
| linkGame | link-game | 中 | 连连看，2D 网格 |
| linkGame_v1 | — | 低 | v1 可合并或跳过 |
| raceGame | race-game | 中 | 赛车 |
| tribleGame | trible-game | 中 | 三消 |
| MikuClick | miku-click | 低 | 点击类 |
| Kannot | kannot | 低 | 音游相关 |
| miku-fireworks-3D | — | 暂缓 | 3D 烟花，成本高 |
| festivalCard | — | 暂缓 | Three.js 贺卡 |
| solarSystem | — | 暂缓 | 3D 天文 |
| mikutap | — | 暂缓 | 音乐互动+配置 |
| purchase-game | — | 暂缓 | Next 页面非 Phaser |
| miku-talking | — | 暂缓 | MMD 3D |
| playMusic / mikuPlanting | — | 暂缓 | 工具/半游戏 |
| Vocaloider / ShareMonitor / VocaloidtoGO | — | 非典型小游戏 | 按需评估 |
| mmdViewer | — | 暂缓 | 3D 查看器 |

阶段 B 只要求：**核心循环可玩**（开始/操作/计分或胜负），不要求美术与原版一致。

## 阶段 C 门槛（单游戏）

- [ ] 手感/难度曲线与原版可接受对齐
- [ ] 实验田主卡片 `path` 切到 `/games/<slug>/`
- [ ] 删除对应 testField 游戏 page/module 与仅该游戏使用的静态资源
- [ ] 移除或合并 `-godot` 副卡片
