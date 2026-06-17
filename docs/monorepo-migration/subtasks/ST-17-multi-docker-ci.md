# ST-17 多应用 Docker 与 CI

**任务 ID**：M-17  
**状态**：pending  
**依赖**：M-12, M-16

## 目标

每个 app 独立镜像与 GitHub Actions workflow（或 matrix），支持独立发版。

## 交付物

- [ ] `apps/web/Dockerfile`
- [ ] `apps/calendar/Dockerfile`
- [ ] `apps/teach-hub/Dockerfile`
- [ ] `.github/workflows/docker-build-web.yml`（或 matrix job）
- [ ] 阿里云镜像 tag 策略：`qhr-profile-web:NNN`、`qhr-profile-calendar:NNN`、`qhr-profile-teach-hub:NNN`
- [ ] 共享：deps 阶段安装 git、HTTPS git rewrite（现有 dockerfile 经验）

## 构建优化

- 各 Dockerfile 仅 COPY 所需 packages（turbo prune 或 pnpm deploy）
- calendar / teach-hub 镜像**不含** aframe、Phaser 等 web 专用依赖

## 验收标准

1. 三镜像均可 build 并 push
2. calendar 镜像体积显著小于原单体（记录 MB 对比）
3. 部署文档写入 `docs/monorepo-migration/deploy.md`（本 ST 可新建）

## 过渡期

- 生产可只部署 web + 反代，calendar/teach-hub 仍内嵌 — **不推荐超过 2 周**
