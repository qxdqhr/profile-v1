# 新增 Godot / 静态游戏旁路

每站 = Godot 源码目录 + `deploy/games/<slug>/www/` 产物。  
平台 nginx **直接 alias** 这些目录，**不要**再为每个游戏加 compose 服务或 location。

**不要**塞进 `apps/*`；**不要**把 `www/` 二进制长期提交进 git。

`app_games/<slug>/` 均为 **git submodule**（独立公开仓）。克隆本仓后需：

```bash
git submodule update --init --recursive
```

Spine 等无法在 CI 重导出的工程：在 submodule 根放置 `.use-prebuilt-web`，并把 Web 产物放在 `prebuilt-app_web/`（文件名 `index.*`）；`export-godot-game.sh` 会直接拷贝到 `deploy/games/<slug>/www/`。

假设 slug = `my-game`（URL：`/games/my-game/`）。slug 只能是小写字母、数字、连字符。

## 1. 源码

```
app_games/my-game/          # Godot 工程（project.godot …）
deploy/games/my-game/
  www/.gitkeep              # CI 写入产物
```

Web 导出预设须 **单线程**：`variant/thread_support=false`（Compatibility）。

## 2. 网关

不必改 `docker-compose.gateway.yml` 或 `profile-platform.conf`。  
平台 nginx 把 `/games/<slug>/*` 映射到 `deploy/games/<slug>/www/`（容器内 `/var/www/games/<slug>/www/`）。

`deploy/smoke-test-gateway.sh`：为新 slug 加上 `index.html` / `index.wasm` / `index.pck` 检查。

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

| slug | 源码 | 路径 |
|------|------|------|
| pulse-parade | `app_games/pulse-parade/` | `/games/pulse-parade/` |
| flappy-wish | `app_games/flappy-wish/` | `/games/flappy-wish/` |
| suika-game | `app_games/suika-game/` | `/games/suika-game/` |
| bubble-shooter | `app_games/bubble-shooter/` | `/games/bubble-shooter/` |
| arknights-bubble-shooter | `app_games/arknights-bubble-shooter/` | `/games/arknights-bubble-shooter/` |
| miku-flick | `app_games/miku-flick/` | `/games/miku-flick/` |
| huarongdao | `app_games/huarongdao/` | `/games/huarongdao/` |
| push-box | `app_games/push-box/` | `/games/push-box/` |
| gold-miner | `app_games/gold-miner/` | `/games/gold-miner/` |
| miku-fusion-game | `app_games/miku-fusion-game/` | `/games/miku-fusion-game/` |
| link-game | `app_games/link-game/` | `/games/link-game/` |
| race-game | `app_games/race-game/` | `/games/race-game/` |
| trible-game | `app_games/trible-game/` | `/games/trible-game/` |
| miku-click | `app_games/miku-click/` | `/games/miku-click/` |
| kannot | `app_games/kannot/` | `/games/kannot/` |
| vocaloid-to-go | `app_games/vocaloid-to-go/` | `/games/vocaloid-to-go/` |
| purchase-game | `app_games/purchase-game/` | `/games/purchase-game/` |
| mikutap-game | `app_games/mikutap-game/` | `/games/mikutap-game/` |
| miku-planting | `app_games/miku-planting/` | `/games/miku-planting/` |
| diner-dash | `app_games/diner-dash/`（submodule；`.use-prebuilt-web`） | `/games/diner-dash/` |
