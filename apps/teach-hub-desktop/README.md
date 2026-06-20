# TeachHub Desktop

`@profile/teach-hub-desktop` — Electron + Vite + React 桌面端脚手架。

与 `apps/teach-hub-mobile` 同级，共享 `packages/teach-hub-shared`。

## 本地开发

```bash
# 终端 1 & 2
pnpm dev:web
pnpm dev:teach-hub

# 终端 3
cp apps/teach-hub-desktop/.env.example apps/teach-hub-desktop/.env
pnpm dev:teach-hub-desktop
```

启动后会打开 Electron 窗口，加载 Vite 开发服务器（`:5174`）。

## V1 能力

- iframe 登录主站（共享 Cookie）
- 工作区列表
- 跳转 Web 工作区（临时方案）

## 后续

- 内嵌工作区 UI（复用 shared API 层）
- 打包分发（electron-builder）
