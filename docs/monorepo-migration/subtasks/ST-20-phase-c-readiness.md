# ST-20 方案 C 预备与拆仓清单

**任务 ID**：M-20  
**状态**：done  
**依赖**：M-19

## 目标

文档化从方案 B（同仓多应用）演进到方案 C（独立产品、可独立仓库/域名）的检查清单，**本 ST 不强制拆仓**。

## 交付物

- [x] [PHASE-C-CHECKLIST.md](../PHASE-C-CHECKLIST.md)
- [x] 内容包含：

### 技术清单

- [x] 各 app 独立环境变量模板（`.env.example`）
- [x] `trustedOrigins` 多子域配置步骤
- [x] Auth 中心：主站签发 cookie vs 独立 auth 服务
- [x] `packages/*` 发布策略（npm private / git subtree）
- [x] 数据库拆分评估（默认：仍共享 Postgres，按 schema 隔离）

### 运维清单

- [x] 三应用独立 SLA、回滚、监控
- [x] 独立 Git 仓库命名：`profile-web`、`profile-calendar`、`profile-teach-hub`
- [x] CI 跨仓版本对齐（changesets / 统一 tag）

### 产品清单

- [x] 品牌与域名：calendar.*、teach.*
- [x] 从 profile 实验田「毕业」后的入口策略

## 验收标准

1. PHASE-C 文档经 review 可执行
2. 团队对 B→C 触发条件达成共识（例如：calendar 日活 / 独立运营需求）

## B 完成定义

当 M-01～M-19 完成且 ST-20 文档就绪，**方案 B 宣告完成**；方案 C 按产品节奏择机启动。
