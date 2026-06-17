# ST-18 网关、反代与路由

**任务 ID**：M-18  
**状态**：pending  
**依赖**：M-17

## 目标

对外单一入口（或按子域拆分），将流量分到三 upstream。

## 交付物

- [ ] Nginx / Caddy 配置示例（仓库 `deploy/nginx/` 或文档）
- [ ] 路由表：

| 路径前缀 | upstream |
|----------|----------|
| `/` | web:3000 |
| `/calendar`, `/api/calendar` | calendar:3001 |
| `/teach-hub`, `/api/teach-hub` | teach-hub:3002 |

- [ ] Cookie domain：`.qhr062.top` 同级路径共享 session
- [ ] 本地 dev：`docker compose` 或 `turbo dev` + 反向代理可选

## 子域方案（可选，面向 C）

| 主机 | upstream |
|------|----------|
| `qhr062.top` | web |
| `calendar.qhr062.top` | calendar |
| `teach.qhr062.top` | teach-hub |

## 验收标准

1. 用户从主站链接跳转 calendar / teach-hub 无需重新登录
2. API 无 CORS 错误（同域反代时）

## 备注

与现有生产 Docker `my_container` 单容器部署对齐，给出迁移 runbook。
