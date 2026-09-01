# Pulse Parade（Godot 4）

节奏天国式同人纯点按 MVP。源码在 monorepo：`games/pulse-parade/`。  
生产旁路：`https://qhr062.top/games/pulse-parade/`。

## 本地运行

```bash
godot --path /home/qhr/project/profile-v1/games/pulse-parade
```

## 本地导出并写入旁路 www

```bash
./scripts/sync-web-to-deploy.sh
```

产物目录：`deploy/games/pulse-parade/www/`（**不进 git**，由 CI 生成）。

## CI

推送 `main` 且改动 `games/pulse-parade/**` 时：

1. `export-pulse-parade-web`：Godot 4.7.1 单线程 Web 导出  
2. `deploy-web`：scp 到服务器网关旁路并冒烟  

详见 `deploy/games/README.md`。
