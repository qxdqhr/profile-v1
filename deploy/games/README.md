# Godot / 静态小游戏旁路（非 Next 子应用）

路径命名空间：`/games/<slug>/`。首期：**`pulse-parade`**（Pulse Parade，Godot 4 Web 单线程）。

## 架构

- **game_\<slug\>**：`nginx:alpine` 静态站，文档根挂载 `deploy/games/<slug>/www/`
- **网关 nginx**：一条前缀 location，去掉 `/games/<slug>` 后反代到容器根（相对路径资源可加载）
- **不进** pnpm / Next Docker matrix；产物由 CI `scp` 同步

## URL

| | |
|---|---|
| 游玩 | `https://<host>/games/pulse-parade/` |

## 更新游戏包

1. 在游戏仓导出 Web：

```bash
cd /home/qhr/project/rhythm-heaven-clone
godot --headless --path . --export-release "Web" export/web/index.html
rsync -a --delete export/web/ /home/qhr/project/profile-v1/deploy/games/pulse-parade/www/
```

2. 提交 `profile-v1` 的 `deploy/games/**` + compose/nginx，push `main` → `deploy-web`。

## 加游戏

见 [ADD-GAME.md](./ADD-GAME.md)。
