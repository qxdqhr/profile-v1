# 现网资源危机与优化方案（qhr062.top）

> 实测日期：2026-09-25  
> 主机：`47.94.166.44` / `qhr062.top`  
> 结论：**不是业务逻辑突然变慢，而是 1.6GiB 内存扛不住 12 个 Next 容器 + 宿主机服务，OOM 后进入无 swap 颠簸，表现为 CPU 100% 并卡死。**

## 1. 实测证据

| 项 | 值 |
|----|-----|
| CPU | 2 vCPU |
| 内存 | **1677 MiB**，available ≈ 300–340 MiB |
| Swap | **0** |
| 镜像 tag | `IMAGE_TAG=660`（约 26h 前部署后未再发版） |
| `kswapd0` | 累计 CPU 时间约 **3h29m**（典型换页颠簸） |
| 内核 OOM | 至少 4 次；已杀掉 `next-server`、`fwupd` |
| Next 进程 | 约 **10** 个，RSS 合计 ≈ **700 MiB** |
| Docker 守护 | dockerd+containerd ≈ **236 MiB** |
| 宿主机其它 | Postgres ≈ 91 MiB；php-fpm（wordpress-blog）≈ 132 MiB；阿里云盾 ≈ 48 MiB；frps ≈ 18 MiB |

容器矩阵（compose）：**12 个 Next** + nginx；`web` / `comfy_prompt` / `nginx` 为 **unhealthy**。  
`web` / `comfy_prompt` healthcheck `FailingStreak≈2511`，日志为 `cannot exec in a stopped state`——进程已被 OOM 打残，Docker 仍每 15s 起 `runc` 探活，进一步烧 CPU。

外层 nginx（`sites-available/nextjs-https`）**没有** `/games/` 的 `gzip off` / `proxy_buffering off`（仓库参考配置未落到现网）。全局 `gzip on`。游戏 www 仍各自约 63–334 MiB 且含完整 `index.wasm`（未见 `games/godot-engine/` 共享引擎落盘）。

## 2. 因果链

```
12× Next 冷启动/常驻 + 宿主机 Postgres/PHP/Docker/安全组件
        ↓
物理内存耗尽（无 swap）
        ↓
kswapd 疯狂换页 → CPU 看起来 100%，SSH/整机假死
        ↓
OOM Killer 杀 next-server（偶发 fwupd）
        ↓
web/comfy 僵尸 + healthcheck 狂刷 runc → 二次 CPU 压力
```

Godot 现场 gzip 是**已知次要雷点**（仓库已防内层 nginx）；现网主因是 **内存容量与进程数不匹配**，不是单次 wasm 压缩。

## 3. 优化方案（分阶段）

### Phase 0 — 立刻止血（现网，不改仓也可做）

目标：把 available 拉回 ≥ 600 MiB，停掉探活风暴，恢复主站。

1. **加 2G swap**（治标，避免再硬死）  
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile
   mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```
2. **停低频卫星**（释放 ~300–400 MiB）  
   ```bash
   cd /root/profile-v1
   docker compose -f docker-compose.gateway.yml stop \
     money_research comfy_prompt utilities fitness_plan ticket_monitor
   ```
3. **重建主站进程**  
   ```bash
   docker compose -f docker-compose.gateway.yml up -d --force-recreate web nginx
   ```
4. **外层 nginx 补 `/games/` 防护**（对齐 `deploy/nginx/outer-ubuntu-qhr062.conf`）后 `nginx -t && systemctl reload nginx`。

保留常开建议：`web` + `calendar` + `teach_hub` + `showmasterpiece` + `node_notes` + `idea_list` + `filetransfer` + `nginx`。

### Phase 1 — 仓内改造（防下次部署再炸）

| 改动 | 说明 |
|------|------|
| compose `mem_limit` / `cpus` | 每个 Next 例如 `mem_limit: 192m`、`cpus: '0.4'`；nginx / 旁路更低 |
| `NODE_OPTIONS=--max-old-space-size=160` | 限制 Node 堆，配合 mem_limit |
| 错峰 `up` | `deploy-profile-v1.sh`：先 web+nginx，再分批卫星，间隔 10–20s |
| healthcheck 放宽 | `interval: 30s`，`start_period: 120s`；失败退避，避免 12×`node -e` |
| 可选 profile | **已落地**：[`deploy/runtime-modules.json`](../../deploy/runtime-modules.json) 手控启停；见 [`deploy/runtime-modules.md`](../../deploy/runtime-modules.md) |
| 服务器禁止 `gzip -9` wasm | 仅当 CI 未带 `.gz` 时才压，且串行、限 CPU（`nice`/`ionice`） |

### Phase 2 — 规格与架构

| 选项 | 建议 |
|------|------|
| **升配（首选）** | 至少 **4C / 8G** 才适合跑满 12 Next + 本机 Postgres + WP；2G 最多 slim 矩阵 |
| 合并进程 | 低频子应用并回主站或改静态/按需容器 |
| DB / WP | Postgres、php-fpm WordPress 若可迁走或关掉闲置 site，再省 200+ MiB |
| 游戏 | 落盘共享 `godot-engine`；大包（9dot 334M）上 OSS/CDN |
| 安全组件 | 评估 AliYunDunMonitor 占用；无法关则必须用内存余量覆盖 |

### Phase 3 — 观测

- 部署前后跑 `deploy/ops/check-server-resources.sh`
- 告警：`available < 200MiB` 或 `dmesg` 出现 OOM
- CI 部署前可增加「目标机 free -m」门禁（optional）

## 4. 容量粗算（现网）

| 组合 | 粗估常驻 | 2C1.6G 是否可行 |
|------|----------|-----------------|
| slim（~7 Next + nginx + PG） | ~0.9–1.2 GiB | 勉强（需 swap） |
| full（12 Next + PG + php-fpm + aegis） | ≥1.5–2.0 GiB | **不可行**（已实证 OOM） |
| full + 冷启动尖峰 | 瞬时更高 | 必炸 |

## 5. 执行顺序建议

1. Phase 0 当天做完（swap + stop 卫星 + recreate web + 外层 `/games/`）。  
2. Phase 1 合进仓库后再发版（避免下次 CI `compose up` 全量拉起）。  
3. 升配或 slim 固化二选一；不升配就不要再开 full 矩阵。

## 6. SSH 备注

- `qhr062.top:6000` 当前返回 `Not allowed at this time`（多半 fail2ban / 端口策略）。  
- 可用：`ssh -i ~/.ssh/id_ed25519 -p 22 root@47.94.166.44`。
