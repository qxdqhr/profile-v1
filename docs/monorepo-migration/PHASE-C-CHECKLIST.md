# 方案 C 预备检查清单（B → C 演进）

> **范围**：从方案 B（同仓多应用 + 网关同域）演进到方案 C（独立产品、可选独立仓库/域名/运维）。  
> **本清单不强制拆仓**；当产品/运营触发条件满足时再逐项执行。  
> **前置**：方案 B 已完成（M-01～M-19 + 本文档 = ST-20）。

---

## 1. 触发条件（团队共识）

在启动方案 C 前，建议至少满足 **一项** 业务触发 + **一项** 技术触发：

| 类型 | 示例 |
|------|------|
| 业务 | calendar / teach-hub 日活或独立运营需求；需独立品牌与域名 |
| 业务 | 子产品需独立 SLA、独立发版节奏，不受主站实验田影响 |
| 技术 | 单仓 CI 构建时间/镜像体积成为瓶颈；需按产品拆分权限与 on-call |
| 技术 | 子产品需对接外部团队，不宜暴露 profile 全仓代码 |

**默认策略**：未触发前维持方案 B（`deploy/docker-compose.gateway.yml` + 三镜像 matrix）。

---

## 2. 技术清单

### 2.1 各 app 环境变量模板

| 应用 | 模板 | 说明 |
|------|------|------|
| web | [apps/web/.env.example](../../apps/web/.env.example) | 子应用链接 `NEXT_PUBLIC_*_URL`、可选 AI 覆盖 |
| calendar | [apps/calendar/.env.example](../../apps/calendar/.env.example) | `NEXT_PUBLIC_BASE_PATH`、`PORT=3001` |
| teach-hub | [apps/teach-hub/.env.example](../../apps/teach-hub/.env.example) | `NEXT_PUBLIC_TEACH_HUB_BASE_URL`、`PORT=3002` |
| 网关部署 | [deploy/.env.example](../../deploy/.env.example) | `REGISTRY`、`IMAGE_TAG`、`GATEWAY_PORT` |
| 共享配置 | [config/app.config.example.yaml](../../config/app.config.example.yaml) | DB、Auth、OSS、AI |

本地三联调（无 nginx）：

```bash
pnpm dev:web          # :3000
pnpm dev:calendar     # :3001
pnpm dev:teach-hub    # :3002
```

生产网关模式：子应用容器内设置 `NEXT_PUBLIC_BASE_PATH=/calendar` 或 `/teach-hub`；web 设置 `NEXT_PUBLIC_CALENDAR_URL=/calendar`、`NEXT_PUBLIC_TEACH_HUB_URL=/teach-hub`。

### 2.2 `trustedOrigins` 多子域配置

**B 阶段（同域）**：`auth.trustedOrigins` 仅需主域，例如 `https://qhr062.top`。

**C 阶段（子域）**：在 `config/app.config.production.yaml`（或 SOPS 加密版）追加：

```yaml
auth:
  url: https://qhr062.top          # Auth API 仍由主站或 auth 子域承载
  publicUrl: https://qhr062.top    # 登录页 / 回调展示用
  trustedOrigins:
    - https://qhr062.top
    - https://calendar.qhr062.top
    - https://teach.qhr062.top
    # 若 Auth 独立：- https://auth.qhr062.top
```

**操作步骤**：

1. 修改 `config/app.config.production.yaml` → SOPS 加密 → CI/服务器挂载解密文件。
2. 各子域 nginx 将 `/api/auth/*` 反代到 Auth 服务（当前 B：主站 web）。
3. Cookie：`SameSite=Lax` + 父域 `.qhr062.top`（若 better-auth 支持 domain 配置，与 `@profile/auth` 实现对齐）。
4. 子应用 `NEXT_PUBLIC_APP_URL` 设为 **用户浏览器所见主域**（通常为 `https://qhr062.top`），而非子域 origin，以保持 session 校验一致。
5. 变更后执行：三应用登录 → 跨子域 API 调用 → 登出，验证无 CORS / 401。

参考：[deploy/MIGRATION-RUNBOOK.md](../../deploy/MIGRATION-RUNBOOK.md)、[ARCHITECTURE.md](./ARCHITECTURE.md) §5。

### 2.3 Auth 中心策略

| 模式 | 适用 | 要点 |
|------|------|------|
| **A. 主站签发 cookie（推荐 B→C 第一步）** | 同父域子域 | Auth 路由留在 `apps/web` 或迁至 `auth.{domain}`；子应用只消费 session |
| **B. 独立 auth 服务** | 完全拆仓、多团队 | 新建 `apps/auth` 或独立仓；所有 app `BETTER_AUTH_URL` 指向 auth 服务 |
| **C. 各 app 自带 Auth 副本** | 不推荐 | 配置漂移、secret 轮换困难 |

**迁移顺序**：A →（可选）B。拆仓时 `packages/auth` 可先发布为 private npm，三仓共用。

### 2.4 `packages/*` 发布策略

| 包 | B 阶段 | C 选项 |
|----|--------|--------|
| `@profile/config` | workspace:* | npm private / GitHub Packages |
| `@profile/auth` | workspace:* | 同上 |
| `@profile/db` | workspace:* | 同上；或各产品只依赖子集 schema |
| `@profile/ui` | workspace:* | 同上 |
| `@profile/calendar-core` | workspace:* | 随 calendar 仓或独立 domain 包 |
| `@profile/teach-hub-core` | workspace:* | 随 teach-hub 仓 |

**推荐**：

- **短期**：git subtree / submodule 同步 `packages/*` 到子仓，版本 tag 对齐。
- **中期**：Changesets + GitHub Actions 发布 `@profile/*` 到 registry，`apps/*` 消费 semver。
- **约束**：domain 包禁止反向依赖 `apps/*`；`calendar-core` ↔ `teach-hub-core` 禁止互依赖。

### 2.5 数据库拆分评估

**默认（B + 早期 C）**：单一 Postgres，`packages/db` 统一 migrate。

| 表前缀 / 域 | 归属 |
|-------------|------|
| `user`、session 等 | 共享 Auth |
| `calendar_*` | calendar |
| `teach_hub_*` | teach-hub |
| 主站业务表 | web |

**拆分触发**（可选，非必须）：

- 子产品需独立备份/扩容/合规隔离
- 连接池争用明显

**拆分步骤（概要）**：

1. 按 schema 或 DB 实例分离；Auth 表仍单点或只读副本同步。
2. 各 app `database.url` 指向独立连接串；migrate 脚本按 package 拆分。
3. 跨域数据（如 user id）仅通过 API / 共享 Auth，不做跨库 FK。

---

## 3. 运维清单

### 3.1 三应用独立 SLA、回滚、监控

| 应用 | 镜像 tag 示例 | 回滚 |
|------|---------------|------|
| web | `qhr-profile-web:NNN` | 单独 `docker pull` + compose 替换 web 服务 |
| calendar | `qhr-profile-calendar:NNN` | 同上 |
| teach-hub | `qhr-profile-teach-hub:NNN` | 同上 |

- **监控**：各 upstream 健康检查（nginx `/health` 或 Next `/_next/static` 探活）；日志按容器名分流。
- **告警**：单应用 5xx 率、构建失败、镜像 push 失败（已有 CI Feishu 通知可扩展为分应用）。
- **回滚**：保留上一 `IMAGE_TAG`；`deploy/MIGRATION-RUNBOOK.md` 含单体回滚示例，网关模式替换对应 service 即可。

### 3.2 独立 Git 仓库命名（建议）

| 仓库 | 内容 |
|------|------|
| `profile-web` | 主站 + `packages/config|auth|db|ui`（或 auth/db 独立仓） |
| `profile-calendar` | `apps/calendar` + `packages/calendar-core` |
| `profile-teach-hub` | `apps/teach-hub` + `packages/teach-hub-core` |
| `profile-platform`（可选） | 仅 deploy、docs、compose、共享 packages 发布 |

### 3.3 CI 跨仓版本对齐

- **统一 tag**：`platform-2026.06.17` 或 semver `v1.2.0` 同时打在三仓 release。
- **Changesets**：monorepo 内先实践，拆仓后各仓 `changeset publish` + 平台仓记录兼容矩阵。
- **集成测试**：staging 环境 compose 固定三镜像 tag 组合，合并前 smoke：登录、calendar CRUD、teach-hub 导入+生成课时。

---

## 4. 产品清单

### 4.1 品牌与域名

| 产品 | B（当前） | C（目标示例） |
|------|-----------|---------------|
| 主站 | `qhr062.top/` | 不变 |
| Calendar | `qhr062.top/calendar` | `calendar.qhr062.top` 或独立品牌域 |
| Teach Hub | `qhr062.top/teach-hub` | `teach.qhr062.top` |

DNS：子域 CNAME → 同一网关或独立 LB；TLS 通配符或 ACME 多域。

### 4.2 实验田「毕业」入口策略

1. **实验田卡片**：`experimentData` 链接改为绝对产品 URL 或子域（非 `/testField/*` legacy）。
2. **Legacy 路径**：nginx 保留 302 `/testField/calendar` → `/calendar`、teachHub 同理，保留 6～12 个月。
3. **主站导航**：实验田仅保留未毕业项目；毕业项移至主导航或产品落地页。
4. **SEO / 书签**：产品页 canonical 指向 C 域名；主站重定向页可逐步下线（B 末 ST-19 已删 web 内重定向页，由网关承担）。

---

## 5. 拆仓执行顺序（建议）

```
1. 文档与 env 模板就绪（ST-20）✓
2. packages/* 发布 pipeline（Changesets）
3. 子域 + trustedOrigins 预发验证
4. 抽 calendar 仓（核心包 + app + CI）
5. 抽 teach-hub 仓
6. 主站瘦身与 platform/deploy 仓
7. （可选）DB 实例拆分
```

---

## 6. 验收（方案 C 启动时）

- [ ] 三应用可在 **仅对应仓库** 内 `pnpm build` 通过
- [ ] 生产子域登录与会话共享验证通过
- [ ] API 契约不变：`/api/calendar/*`、`/api/teach-hub/*`（或子域等价路径）
- [ ] 回滚演练：单应用 tag 回退 ≤ 15 分钟
- [ ] 产品入口无 `/testField/*` 硬依赖

---

## 7. 相关文档

- [TASKS.md](./TASKS.md) — M-01～M-20 总表
- [ARCHITECTURE.md](./ARCHITECTURE.md) — 边界与 B 形态
- [deploy.md](./deploy.md) — 镜像与 CI
- [deploy/MIGRATION-RUNBOOK.md](../../deploy/MIGRATION-RUNBOOK.md) — 网关上线与回滚

**方案 B 完成定义**：M-01～M-19 完成且本文档就绪；方案 C 按上表触发条件择机启动。
