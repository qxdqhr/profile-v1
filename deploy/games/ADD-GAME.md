# 新增 Godot / 静态游戏旁路

每站 = Godot 源码目录 + nginx 静态容器 + 网关前缀 location + CI 导出。  
**不要**塞进 `apps/*`；**不要**把 `www/` 二进制长期提交进 git。

假设 slug = `my-game`（URL：`/games/my-game/`）。

## 1. 源码

```
games/my-game/          # Godot 工程（project.godot …）
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

`scripts/export-all-godot-games.sh` 会自动扫 `games/*/project.godot`。  
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
| pulse-parade | `games/pulse-parade/` | `game_pulse_parade` | `/games/pulse-parade/` |
| flappy-wish | `games/flappy-wish/` | `game_flappy_wish` | `/games/flappy-wish/` |
| suika-game | `games/suika-game/` | `game_suika_game` | `/games/suika-game/` |
| bubble-shooter | `games/bubble-shooter/` | `game_bubble_shooter` | `/games/bubble-shooter/` |
| arknights-bubble-shooter | `games/arknights-bubble-shooter/` | `game_arknights_bubble_shooter` | `/games/arknights-bubble-shooter/` |
