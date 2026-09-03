# CR — sa2kit（通用基建 + business 实验田库）

| 项 | 内容 |
|----|------|
| 源码 | submodule `packages/sa2kit/`（独立 git / npm；原 `~/project/sa2kit`） |
| 版本 | **3.9.1**（与 profile-v1 pin 一致） |
| 形态 | 单包 npm；`src/common` + `src/business`；tsup 双阶段构建 |
| 规模 | ~697 源文件 / ~92k 行；`dist/` ≈ 32MB |
| profile 引用 | **183** 个 TS/TSX 文件 import `sa2kit/*` |
| 评审日期 | 2026-08-29 |
| 状态 | ✅ reviewed（首轮；business 深挖待分模块二轮） |

---

## 1. 在 profile-v1 中的位置

```
sa2kit/common/{auth,config,file,aiApi,components,…}
        ↓ 薄封装
@profile/{auth,config,db}
        ↓
app_web/* + packages/*-core

sa2kit/business/{mmd,testYourself,festivalCard,music,…}
        ↓ 直接 import（多数仍在 app_web/web）
实验田页面 / examples
```

战略（库 `package.json` description）：**common API 稳定；business 逐步迁回 profile-v1**。

与 **sa2kit-ui**：**无代码依赖**；仅命名同源。UI 业务组件走 `sa2kit/common/components`，动森装饰 UI 走 sa2kit-ui / animal-island-ui。

---

## 2. 模块清单（摘要）

### common（稳定层）

| 模块 | 职责 | profile 热度 |
|------|------|--------------|
| `auth` | Better Auth + schema + React/RN UI | 高（经 `@profile/auth`） |
| `config` | YAML AppConfig bootstrap | 高（`@profile/config`） |
| `file` / `ossFile` / `universalFile` | 文件 SSOT + OSS | 高 |
| `aiApi` | OpenAI 兼容 + `runAiTask` + 设置 UI | 高（app_web/calendar/teach-hub） |
| `components` | Modal/Card/SearchBox 等 | 最高频 import |
| `export` / `universalExport` | 导出 | 中 |
| `logger` / `storage` / `request` / `i18n` / `platform` | 基础能力 | 中低 |

### business（迁出中）

| 模块 | npm 子路径 | 备注 |
|------|------------|------|
| `mmd` | ✅ | profile ~34 imports，优先迁出候选 |
| `testYourself` | ✅ | admin UI 缺鉴权，见 P0 |
| `festivalCard` / `music` / `vocaloidBooth` / … | ✅ | 按实验田使用 |
| `ar` / `bubbleShooter` / `iflytek` / `testField` / `profile` | ❌ 或仅根 barrel | export 与源码不一致 |

---

## 3. 架构合规（相对 profile 约定）

| 检查项 | 结果 |
|--------|------|
| 鉴权经 `@profile/auth` 薄封装 | ✅ 多数路径；少数直调 `sa2kit/common/auth/server` |
| Schema 由 `@profile/db` 聚合 sa2kit 表 | ✅ 强耦合（接受现状） |
| browser/node 条件导出（file/auth） | ✅ |
| common 禁止依赖 business（ESLint） | ✅（库内门禁） |
| README / CHANGELOG 与 3.9.1 同步 | ❌ 严重滞后 |

---

## 4. 发现项

| ID | 严重度 | 标题 | 位置 | 建议 | 状态 |
|----|--------|------|------|------|------|
| SK-001 | **P0** | testYourself admin 页面无 AuthGuard / role | `examples/test-yourself-admin/page.tsx` + `business/testYourself/admin` | 宿主加 `isAdminRole` + Guard；库文档标明「UI 不含鉴权」 | open |
| SK-002 | **P0** | UserMenu 用 `role === 'admin'`，enum 为 `ADMIN`/`SUPER_ADMIN` | `common/auth/.../UserMenu.tsx:64` vs `schema/enums.ts` | 改用 uppercase 或复用 `isAdminRole` 语义 | open |
| SK-003 | **P0** | 文件/OSS 服务不强制鉴权（依赖宿主 route） | `universalFile/server` | 清单审计所有 upload route；库层可选 `requireAuth` hook | open |
| SK-004 | P1 | CHANGELOG 停在 3.7.0，README 仍写 3.2.0 | 库根文档 | 补 3.8–3.9 notes；修正示例 import | open |
| SK-005 | P1 | 双份 PermissionGuard，且只验登录 | `common/components` vs `business/testField` | 合并；增加 role 可选参数 | open |
| SK-006 | P1 | 无统一 `requireAdminSession` | auth/server | 在 sa2kit 或 `@profile/auth` 提供 | open |
| SK-007 | P1 | 构建期 auth secret 回退占位 | `resolve-auth-env.ts` | 运行时禁止占位 secret；仅允许 build phase | open |
| SK-008 | P1 | profile `modules/aiApi` 几乎全是 re-export | `app_web/web/src/modules/aiApi` | 删薄层，直连 sa2kit | open |
| SK-009 | P1 | `@profile/db` 强绑 sa2kit schema | `packages/db/schema` | 变更需双边迁移 checklist | open |
| SK-010 | P2 | business 源码有、export 无（ar/bubbleShooter/…） | `src/business` vs tsup entries | 迁出 / 删除 / 补 export | open |
| SK-011 | P2 | dist 32MB（three/mmd/music 拖累） | dist/ | 加速 business 迁出 | open |
| SK-012 | P2 | MMD playlist 保存 TODO | `MmdPlaylistEditor.tsx` | 补 API 或隐藏保存 | open |
| SK-013 | P2 | 测试覆盖偏 common；business 几乎无测 | `tests/` | 优先 auth role、file bootstrap、aiApi | open |
| SK-014 | P3 | profile docs 仍写 `sa2kit/mmd` | `docs/modules/mmd/sa2kit-mmd-*.md` | 改为 `business/mmd` | open |

关联 profile 脚本问题见 [CROSS-CUTTING.md](../CROSS-CUTTING.md) CX-008（`userSessions` + role 小写查询）。

---

## 5. 优点

- common / business ESLint 门禁 + tsup entries 校验 + exports 自动同步  
- auth / file browser·node 条件导出，利于 Next SSR  
- profile 薄封装（`@profile/auth|config`）隔离升级面  
- aiApi 收敛后多子应用复用清晰  
- `verify:publish-artifact` 防 business dist 缺失

---

## 6. 建议二轮 Deep-Dive

1. 枚举所有 `*/admin` 与 mmd admin 宿主路由，统一 admin 门禁  
2. upload / universal-file 全路由鉴权表  
3. business 迁出排期：mmd → testYourself → festivalCard  
4. 从 git log 补写 3.8.0 / 3.9.x CHANGELOG

---

## 7. 跟进

- [ ] SK-001 / SK-002（P0，可跨仓修）  
- [ ] SK-003 路由鉴权清单（profile 侧）  
- [ ] SK-004 文档同步（sa2kit 仓）  
- [ ] SK-008 删除 aiApi re-export 层
