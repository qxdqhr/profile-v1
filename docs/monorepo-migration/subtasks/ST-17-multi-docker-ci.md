# ST-17 多应用 Docker 与 CI

**任务 ID**：M-17  
**状态**：done  
**依赖**：M-12, M-16

## 目标

每个 app 独立镜像与 GitHub Actions workflow（或 matrix），支持独立发版。

## 交付物

- [x] `apps/web/Dockerfile`
- [x] `apps/calendar/Dockerfile`
- [x] `apps/teach-hub/Dockerfile`
- [x] `.github/workflows/docker-build-push.yml` matrix（web / calendar / teach-hub）
- [x] 阿里云镜像 tag：`qhr-profile-web:NNN`、`qhr-profile-calendar:NNN`、`qhr-profile-teach-hub:NNN`（web 兼容推送 `qhr-profile:NNN`）
- [x] 共享：deps 阶段 git、HTTPS git rewrite、pnpm filter + ignore-scripts（子应用）

## 构建说明

- 构建上下文：仓库根目录
- calendar/teach-hub 使用 `pnpm install --filter @profile/{app}...`（不安装 web 的 phaser/pixi 等）
- sa2kit → ar.js → aframe 仍为 calendar/teach-hub 传递依赖（git 包 three-bmfont-text）；deps 阶段含重试
- 部署文档：[deploy.md](../deploy.md)

## 验收记录（2026-06-17）

1. 三 Dockerfile 与 matrix workflow 就绪
2. `deploy-web` 仍仅部署 web；calendar/teach-hub 镜像 push 待 ST-18 反代
3. 本地 `pnpm --filter @profile/{web,calendar,teach-hub} build` 已通过（前置 ST）

## 后续（ST-18）

Nginx 反代 calendar:3001、teach-hub:3002；单机多容器或分端口部署。
