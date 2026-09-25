# 现网子应用开关（runtime-modules.json）

用 [`runtime-modules.json`](./runtime-modules.json) **手动控制**每次部署启动哪些 Next / WordPress 容器。改完 push `main` 后，GitHub Actions `deploy-web` 会把该文件同步到服务器，并由 `gateway/deploy-profile-v1.sh` 读取。

## 怎么改

1. 编辑 `deploy/runtime-modules.json`，把不需要的模块设为 `false`（`web` 必须为 `true`）。
2. commit + push `main`（或只改该文件也会触发 `deploy/**` path filter）。
3. 部署日志会出现：`runtime-modules: enabled=... disabled=...`。
4. 未启用的模块：**不 pull / 不 up**；nginx 路由块会被裁掉；冒烟测试会 `SKIP`。

当前默认（适配 2C/1.6G）关闭：`money_research`、`ticket_monitor`、`fitness_plan`、`comfy_prompt`、`utilities`、`wordpress_holt`。

## 键名 ↔ compose 服务

| JSON 键 | compose service |
|---------|-----------------|
| `web` | `web`（必开） |
| `calendar` | `calendar` |
| `teach_hub` | `teach_hub` |
| `showmasterpiece` | `showmasterpiece` |
| `money_research` | `money_research` |
| `node_notes` | `node_notes` |
| `idea_list` | `idea_list` |
| `filetransfer` | `filetransfer` |
| `ticket_monitor` | `ticket_monitor` |
| `fitness_plan` | `fitness_plan` |
| `comfy_prompt` | `comfy_prompt` |
| `utilities` | `utilities` |
| `wordpress_holt` | `wp_mariadb` + `wordpress_holt` |

Godot `/games/*` 是静态文件，不走本开关。

## 本地校验

```bash
python3 deploy/gateway/resolve-runtime-modules.py deploy/runtime-modules.json
python3 deploy/gateway/render-runtime-nginx.py \
  deploy/runtime-modules.json \
  deploy/nginx/profile-platform.conf \
  deploy/nginx/profile-platform.runtime.conf
```

`profile-platform.conf` 是带 `# @module` 标记的完整源；`profile-platform.runtime.conf` 是生成结果（compose 挂载它）。改 JSON 或完整源后请重新生成并提交 runtime 文件，避免本地 compose 读到过期配置。

背景：[`docs/infrastructure/server-resource-optimization.md`](../docs/infrastructure/server-resource-optimization.md)。
