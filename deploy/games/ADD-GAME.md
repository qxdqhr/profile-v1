# 新增 Godot / 静态游戏旁路

每站 = Godot 源码目录 + nginx 静态容器 + 网关前缀 location + CI 导出。  
**不要**塞进 `apps/*`；**不要**把 `www/` 二进制长期提交进 git。

假设 slug = `my-game`（URL：`/games/my-game/`）。

## 1. 源码

```
games/my-game/          # Godot 工程（project.godot …）
deploy/games/my-game/
  nginx.conf
  www/.gitkeep         # CI 写入产物
```

## 2. compose / nginx

同 `pulse-parade`：复制 `game_*` 服务与去前缀 `location /games/my-game/`。

## 3. CI

1. `paths-filter` 增加 `games` 路径（或独立 filter）
2. 复制 / 扩展 `scripts/export-pulse-parade-web.sh`（改 GAME_DIR / OUT_DIR）
3. `export-*-web` job → artifact
4. `deploy-web`：games 变更时 download artifact 并 scp `www/`

## 4. 冒烟

`GET /games/my-game/`、`index.wasm`、`index.pck` → 200

## 清单

| slug | 源码 | 服务名 | 路径 |
|------|------|--------|------|
| pulse-parade | `games/pulse-parade/` | `game_pulse_parade` | `/games/pulse-parade/` |
