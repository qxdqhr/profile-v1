# 新增 Godot / 静态游戏旁路

每站 = Godot 源码目录 + nginx 静态容器 + 网关前缀 location + CI 导出。  
**不要**塞进 `apps/*`；**不要**把 `www/` 二进制长期提交进 git。

`app_games/<slug>/` 均为 **git submodule**（独立公开仓）。克隆本仓后需：

```bash
git submodule update --init --recursive
```

Spine 等无法在 CI 重导出的工程：在 submodule 根放置 `.use-prebuilt-web`，并把 Web 产物放在 `prebuilt-app_web/`（文件名 `index.*`）；`export-godot-game.sh` 会直接拷贝到 `deploy/games/<slug>/www/`。

假设 slug = `my-game`（URL：`/games/my-game/`）。

## 1. 源码

```
app_games/my-game/          # Godot 工程（project.godot …）
deploy/games/my-game/
  nginx.conf            # 可复制 flappy-wish / pulse-parade
  www/.gitkeep          # CI 写入产物
```

Web 导出预设须 **单线程**：`variant/thread_support=false`（Compatibility）。

## 2. compose / nginx

1. `deploy/docker-compose.gateway.yml`：复制 `game_flappy_wish` → `game_my_game`，挂载 `./games/my-game/...`
2. gateway `depends_on` 加上新服务
3. `deploy/nginx/profile-platform.conf`：`/games/my-game/` 去前缀反代（照抄现有块）
4. `deploy/smoke-test-gateway.sh`：检查 `index.html` / `index.wasm` / `index.pck`

## 3. CI

`scripts/export-all-godot-games.sh` 会自动扫 `app_games/*/project.godot`。  
`export-godot-games` artifact / `deploy-web` 放置步骤会扫 `deploy/games/*/www`（有 `index.html` 的 slug）。  
**一般不必**再改 workflow，除非改了导出脚本路径 filter。

## 4. 实验田入口（双轨）

策略见 [GODOT-REWRITE-PLAN.md](./GODOT-REWRITE-PLAN.md)。

- **保留**原版卡片：`path: '/testField/<OldName>'`
- **另加** Godot 最简卡片：`id: 'my-game-godot'`，`path: '/games/my-game/'`（末尾斜杠），`isCompleted: false`
- `/games/` 卡片经 `ExperimentNavCard` **整页跳转**（避免 Next Link 404）
- **不要**在阶段 B 删除 testField 游戏 page/module

## 5. 冒烟

`GET /games/my-game/`、`index.wasm`、`index.pck` → 200

## 清单

| slug | 源码 | 服务名 | 路径 |
|------|------|--------|------|
| pulse-parade | `app_games/pulse-parade/` | `game_pulse_parade` | `/games/pulse-parade/` |
| flappy-wish | `app_games/flappy-wish/` | `game_flappy_wish` | `/games/flappy-wish/` |
| suika-game | `app_games/suika-game/` | `game_suika_game` | `/games/suika-game/` |
| bubble-shooter | `app_games/bubble-shooter/` | `game_bubble_shooter` | `/games/bubble-shooter/` |
| arknights-bubble-shooter | `app_games/arknights-bubble-shooter/` | `game_arknights_bubble_shooter` | `/games/arknights-bubble-shooter/` |
| miku-flick | `app_games/miku-flick/` | `game_miku_flick` | `/games/miku-flick/` |
| huarongdao | `app_games/huarongdao/` | `game_huarongdao` | `/games/huarongdao/` |
| push-box | `app_games/push-box/` | `game_push_box` | `/games/push-box/` |
| gold-miner | `app_games/gold-miner/` | `game_gold_miner` | `/games/gold-miner/` |
| miku-fusion-game | `app_games/miku-fusion-game/` | `game_miku_fusion_game` | `/games/miku-fusion-game/` |
| link-game | `app_games/link-game/` | `game_link_game` | `/games/link-game/` |
| race-game | `app_games/race-game/` | `game_race_game` | `/games/race-game/` |
| trible-game | `app_games/trible-game/` | `game_trible_game` | `/games/trible-game/` |
| miku-click | `app_games/miku-click/` | `game_miku_click` | `/games/miku-click/` |
| kannot | `app_games/kannot/` | `game_kannot` | `/games/kannot/` |
| vocaloid-to-go | `app_games/vocaloid-to-go/` | `game_vocaloid_to_go` | `/games/vocaloid-to-go/` |
| purchase-game | `app_games/purchase-game/` | `game_purchase_game` | `/games/purchase-game/` |
| mikutap-game | `app_games/mikutap-game/` | `game_mikutap_game` | `/games/mikutap-game/` |
| miku-planting | `app_games/miku-planting/` | `game_miku_planting` | `/games/miku-planting/` |
| diner-dash | `app_games/diner-dash/`（submodule；`.use-prebuilt-web`） | `game_diner_dash` | `/games/diner-dash/` |
