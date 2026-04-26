# Skill 管理模块开发文档（profile-v1）

## 1. 背景与目标

在 `profile-v1` 中新增一个“Skill 管理模块”，并采用“双端协同”模式：

- 本地客户端（Desktop）负责本地 Skill 目录管理
- Web 后台负责在线集中管理与共享

统一支持：

- 上传（单文件、批量、目录全量）
- 下载（单个、批量打包）
- 预览（列表预览 + 内容预览）
- 编辑（`SKILL.md` 内容编辑与元信息校验）

模块目标是把散落在本地 Cursor 目录中的 Skill，沉淀为可视化、可维护、可共享、可同步的资产体系。

---

## 2. 需求扩展（功能拆解）

### 2.1 核心功能（MVP）

1. Skill 列表页
- 展示 Skill 名称、来源（本地/远端）、更新时间、文件数、状态（草稿/已发布）
- 支持搜索（名称、description、标签）与筛选（来源、状态）

2. 上传能力
- 上传单个 `SKILL.md`
- 上传完整 Skill 目录（含 `SKILL.md`、附属文档、scripts）
- 批量上传多个 Skill 目录

3. 下载能力
- 下载单个 Skill（zip）
- 批量下载（zip 合包）
- 支持下载最新版本/指定版本（V2）

4. 预览能力
- 卡片级预览：`name`、`description`、目录树摘要
- 详情预览：`SKILL.md` 渲染（Markdown）+ 原始文本切换
- 文件树预览：支持点击查看 `reference.md` / `examples.md`

5. 编辑能力
- 编辑 `SKILL.md` 内容（代码编辑器）
- 结构化编辑头部 Frontmatter（name/description）
- 保存前校验（格式、字段长度、命名规则）

6. 双端管理能力
- 本地客户端可直接读取并管理本地 `~/.cursor/skills`
- Web 后台管理在线 Skill（列表、预览、编辑、下载）
- 支持“本地 -> 云端”上传与批量上传
- 支持“本地 <-> 云端”同步任务（MVP 先做单向，本地到云端）

### 2.2 增强功能（建议）

1. 本地 `.cursor` 全量导入
- 一键扫描并导入 `~/.cursor/skills/**/SKILL.md`
- 自动识别 Skill 名称并去重
- 支持“覆盖 / 跳过 / 另存新版本”

2. 版本管理（V2）
- 每次编辑产生版本快照
- 支持 diff 对比与回滚

3. 质量检查（Lint）
- 校验 `name`（小写+中划线，<=64）
- 校验 `description`（非空，<=1024）
- 校验目录结构（是否存在 `SKILL.md`）

4. 同步能力（V2）
- “从本地同步到平台”
- “从平台同步到本地目录”（可选，需要本地 agent/bridge）
- 支持冲突检测（同名 Skill、同路径不同内容）
- 支持增量同步（按 hash/mtime）

---

## 3. 范围定义

### 3.1 In Scope

- Skill 资源的 CRUD（以 `SKILL.md` 为核心）
- 文件上传、下载、预览、编辑
- 本地 Cursor 目录导入（用户确认后执行）
- 本地客户端读取目录并管理本地 Skill
- 本地客户端向 Web 平台上传、批量上传、同步

### 3.2 Out of Scope（本期不做）

- 复杂协作工作流（审批流、多人并发锁）
- GitHub PR 自动提交流程
- 跨机器自动写入任意本地文件系统（未安装本地客户端时）

---

## 4. 与现有“通用上传组件”对齐方案

参考现有链路：

- 前端上传入口：`sa2kit/universalFile` 客户端能力
- 服务端上传入口：`/api/universal-file/upload`
- 服务端文件能力：`UniversalFileService`

落地原则：

1. Skill 模块复用统一上传基础设施，不重复造上传轮子。
2. `moduleId` 固定建议为：`skill-manager`。
3. 上传时按 Skill 目录组织 `customPath`：`skill-manager/<skillName>/<relativePath>`。
4. 上传成功后记录统一 `fileId`，预览/下载统一走文件服务。

---

## 5. 技术方案设计

## 5.1 模块目录建议

```text
src/modules/skillManager/
├── DEVELOPMENT.md
├── index.ts
├── types/
│   └── index.ts
├── services/
│   ├── skillManagerService.ts
│   └── skillParser.ts
├── components/
│   ├── SkillUploader.tsx
│   ├── SkillList.tsx
│   ├── SkillDetailDrawer.tsx
│   ├── SkillEditor.tsx
│   └── SkillPreview.tsx
├── pages/
│   └── SkillManagerPage.tsx
└── api/
    ├── skills/route.ts
    ├── skills/[id]/route.ts
    ├── skills/[id]/download/route.ts
    └── skills/import-local/route.ts
```

页面路由建议：

- `src/app/(pages)/testField/(utility)/skillManager/page.tsx`
- 访问路径：`/testField/skillManager`

### 5.1.1 双端架构建议（新增）

1. Desktop 客户端（本地）
- 技术选型：Electron（固定）
- 能力：读取本地 `~/.cursor/skills`、本地预览编辑、上传/批量上传、同步任务管理
- 关键模块：
  - `local-skill-scanner`（扫描本地目录）
  - `local-skill-editor`（本地编辑与校验）
  - `sync-engine`（上传队列、断点续传、冲突处理）

2. Web 管理后台（在线）
- 能力：在线 Skill 列表、预览、编辑、下载、版本管理、审计记录
- 对接：通过统一 `skill-manager` API 与上传服务存储元数据及文件

3. 协同关系
- Desktop 是“本地真相源”（Local Source of Truth）
- Web 是“集中管理与共享中心”
- 同步模型：先支持 `Local -> Web`，再扩展 `Web -> Local`

---

## 5.2 数据模型（建议）

### skill_entities
- `id` string
- `name` string
- `description` string
- `source` enum(`local_cursor`,`manual_upload`,`remote`)
- `status` enum(`draft`,`published`,`archived`)
- `version` int
- `createdBy` string
- `createdAt` datetime
- `updatedAt` datetime

### skill_files
- `id` string
- `skillId` string
- `fileId` string（关联 UniversalFile）
- `relativePath` string（如 `SKILL.md`、`examples.md`）
- `size` number
- `mimeType` string
- `hash` string
- `createdAt` datetime

### skill_versions（V2）
- `id` string
- `skillId` string
- `version` int
- `snapshot` json（核心文件快照）
- `changeLog` string
- `createdAt` datetime

---

## 5.3 API 设计（REST）

1. `GET /api/skill-manager/skills`
- 查询列表，支持 `keyword/source/status/page/limit`

2. `POST /api/skill-manager/skills`
- 新建 Skill（可传元信息 + 文件清单）

3. `GET /api/skill-manager/skills/:id`
- 获取 Skill 详情（含文件树、预览数据）

4. `PUT /api/skill-manager/skills/:id`
- 更新 Skill（name/description/status/source）
- 规则补充：
  - `status`：允许常规编辑流程更新
  - `source`：仅管理员可更新（`admin/super_admin`），非管理员请求需返回 `403`

5. `PUT /api/skill-manager/skills/:id/content`
- 更新 `SKILL.md` 内容（编辑保存）

6. `POST /api/skill-manager/skills/:id/files`
- 新增文件上传关联（支持目录批量）

7. `GET /api/skill-manager/skills/:id/download`
- 下载单个 Skill（zip）

8. `POST /api/skill-manager/skills/batch-download`
- 批量下载（zip）

9. `POST /api/skill-manager/skills/import-local`
- 从本地 Cursor 目录导入（见 6. 本地导入方案）

10. `POST /api/skill-manager/sync/tasks`
- 创建同步任务（来源、模式、范围）

11. `GET /api/skill-manager/sync/tasks/:taskId`
- 查询同步进度（成功/失败数、冲突数）

12. `POST /api/skill-manager/sync/tasks/:taskId/retry`
- 重试失败项

返回体统一建议：

- `success: boolean`
- `data: any`
- `error?: string`
- `meta?: { timestamp, duration, ... }`

---

## 5.4 前端交互流程

1. 进入页面
- 拉取 Skill 列表
- 默认按更新时间倒序

2. 上传流程
- 用户选择“文件/目录”
- 前端校验（存在 `SKILL.md`、文件大小、数量限制）
- 调用统一上传接口，逐文件上传并回传进度
- 上传完成后调用 Skill 绑定接口，刷新列表

3. 预览流程
- 点击某 Skill 打开详情抽屉
- 默认渲染 `SKILL.md` markdown
- 可切换“原始文本/文件树”

4. 编辑流程
- 点击“编辑”进入编辑器
- 提交前执行前端 + 后端双校验
- 保存成功后刷新详情与列表
- `source` 字段在前端仅对管理员（`admin/super_admin`）显示可编辑控件；普通用户仅可查看

5. 下载流程
- 单项下载：直接触发 zip 流
- 批量下载：提交选中项，生成并下载聚合 zip

---

## 6. 本地 `.cursor` 目录全量上传方案

> 需求：支持从本地 Cursor 目录直接全量上传。

### 方案 A（推荐，纯 Web 可行）

通过浏览器目录选择器让用户选择本地目录（例如 `~/.cursor/skills`）：

- 前端使用 `<input type="file" webkitdirectory multiple />`
- 遍历 `FileList`，读取 `webkitRelativePath`
- 自动按一级目录分组为 Skill 单元
- 检测每组是否包含 `SKILL.md`
- 调用统一上传 + Skill 建档接口

优点：
- 不依赖额外本地服务
- 跨平台，集成快

限制：
- 需要用户手动选择目录（浏览器安全限制）
- 无法“后台静默读取任意本地路径”

### 方案 B（进阶，体验更强）

增加本地桥接服务（CLI/Agent API）：

- 后端触发本地扫描任务，直接读取 `~/.cursor/skills`
- 产出文件清单后批量上传
- 支持持续同步（监听目录变更，触发增量同步）

优点：
- 真正“一键导入”
- 可做增量同步（按 hash 比较）

限制：
- 需要额外本地权限与安全设计
- 实施成本更高

### 方案 C（你当前新需求，双端正式方案）

引入“本地桌面客户端（Electron）”作为标准入口：

1. 本地管理
- 客户端读取 `~/.cursor/skills`
- 提供本地列表、预览、编辑、重命名、删除（可选）

2. 上传与批量上传
- 选择单个/多个 Skill 后上传到 Web
- 上传时自动分组为 Skill 单元并校验 `SKILL.md`

3. 同步
- 支持全量同步（首次）
- 支持增量同步（后续，按 hash + mtime）
- 同步策略：覆盖/跳过/新建版本

4. 任务中心
- 展示同步任务状态、失败原因、重试入口

### 本期建议

MVP 采用“方案 A + 方案 C（简化版）”：

- Web 侧先提供完整 Skill 管理与同步 API
- Desktop 侧先实现：扫描本地目录、批量上传到 Web、查看同步结果
- 接口层预留完整双向同步扩展点（`mode=browser|agent|desktop`）

---

## 6.1 同步冲突策略（参考 Git）

> 目标：在 Skill 同步中引入接近 Git 的冲突处理语义，降低心智成本。

### 基本概念映射

- 本地客户端（Electron）= Local
- Web 平台 = Remote
- Skill 内容快照（按文件 hash 聚合）= Commit
- 同步点（最近一次成功同步的快照）= Base

### 判定规则

1. Local == Remote（hash 相同）
- 判定：无变更
- 动作：跳过（No-op）

2. Base == Remote，Local 有新变更
- 判定：Fast-forward（本地领先）
- 动作：直接上传本地变更到远端

3. Base == Local，Remote 有新变更
- 判定：Behind（本地落后）
- 动作：默认先拉取远端再应用本地（按策略可选）

4. Base、Local、Remote 三方均不一致
- 判定：Diverged（分叉冲突）
- 动作：进入冲突处理流程（见下表）

### 冲突策略详细规则表

| 策略键 | Git 参考语义 | 触发条件 | 行为定义 | 适用场景 | 风险 |
|---|---|---|---|---|---|
| `ff-only` | fast-forward only | 仅允许 Base==Remote 或 Base==Local 的单边变更 | 只做快进同步；遇到分叉直接失败并提示 | 生产安全优先 | 需要人工介入较多 |
| `rebase-local` | git rebase | 发生分叉，且本地变更可重放 | 先获取 Remote 最新，再按文件级 patch 重放 Local 变更；失败则标冲突文件 | 以远端为主线，保留本地改动 | 自动重放可能失败 |
| `merge-auto` | git merge | 发生分叉且可自动合并 | 执行三方合并（Base/Local/Remote）；可自动合并则提交新版本 | 协作频繁、希望自动化 | 语义冲突仍需人工确认 |
| `prefer-local` | force push / ours | 分叉或落后 | 以 Local 全量覆盖 Remote，Remote 旧版本保留快照 | 本地为权威源 | 覆盖风险高 |
| `prefer-remote` | hard reset to remote | 分叉或本地落后 | 丢弃 Local 未同步变更，以 Remote 覆盖本地工作副本 | 云端为权威源 | 本地未备份改动丢失 |
| `manual` | 手工解决冲突 | 任意冲突场景 | 生成冲突报告，由用户逐文件选择“本地/远端/合并编辑” | 高价值 Skill、需精准控制 | 成本较高 |

### 文件级冲突处理（建议）

1. `SKILL.md`：
- 默认采用三方合并尝试
- 若 frontmatter 冲突（`name/description`）则强制人工确认

2. 辅助文档（`reference.md/examples.md`）：
- 优先自动合并，失败转人工

3. `scripts/*`：
- 默认保守策略（`manual`），避免脚本语义被错误合并

### 同步提交语义（建议）

- 每次同步生成 `syncCommitId`
- 记录：
  - `baseSnapshotId`
  - `localSnapshotId`
  - `remoteSnapshotId`
  - `strategy`
  - `result`（success/partial/failed）
  - `conflicts[]`

### MVP 默认策略建议

- 默认：`ff-only`
- 可选：`rebase-local`
- 禁用：`prefer-local`（仅管理员可开启）

---

## 7. 校验与安全设计

1. 文件校验
- 必须存在 `SKILL.md`
- 单文件大小上限（建议 10MB）
- 目录文件数上限（建议 200）
- 拒绝可执行危险文件（如 `.exe/.sh`，按策略）

2. 内容校验
- Frontmatter 必须可解析
- `name` 符合规范：`^[a-z0-9-]{1,64}$`
- `description` 非空且 <= 1024
- 编辑保存时执行前后端双校验；后端校验失败返回 `400` 并提供字段级报错信息

3. 权限校验
- 上传/编辑/删除需登录
- 下载按权限控制（public/private）
- 所有写操作记录审计日志
- `source` 字段属于受保护元数据：仅管理员可修改，普通用户只能查看
- `source` 可选值支持环境变量配置：
  - 服务端：`SKILL_MANAGER_ADMIN_SOURCE_OPTIONS`（逗号分隔）
  - 前端：`NEXT_PUBLIC_SKILL_MANAGER_ADMIN_SOURCE_OPTIONS`（逗号分隔）
  - 默认值：`local_cursor,manual_upload,remote`

4. 防护策略
- 接口限流（IP + userId）
- 上传 MIME 白名单
- Markdown 预览 XSS 清洗

---

## 8. 性能与可用性

1. 大批量上传
- 分片/并发队列（并发数 3~5）
- 失败重试（指数退避）

2. 列表性能
- 分页 + 搜索防抖
- 详情懒加载（打开抽屉再拉详情）

3. 下载性能
- 服务端临时 zip 流式返回
- 大包下载增加任务状态（V2）

---

## 9. 分期实施计划

### Phase 1（MVP，1~1.5 周）
- 列表页 + 详情页（预览）
- 上传（单文件/目录）
- 编辑 `SKILL.md`
- 单个下载
- 本地目录导入（方案 A）
- Desktop 最小版：读取本地目录 + 批量上传到 Web

### Phase 2（增强，1 周）
- 批量下载
- 版本快照与 diff
- 质量检查面板（lint）
- 同步任务中心（任务查询、失败重试）

### Phase 3（进阶，按需）
- Desktop 完整双向同步（Local <-> Web）
- 冲突解决与增量同步策略

---

## 10. 验收标准（DoD）

1. 功能验收
- 能上传包含 `SKILL.md` 的目录并成功建档
- 能在线预览并编辑 `SKILL.md`，保存后可立即生效
- 能下载单个 Skill zip
- 能从本地选择 `.cursor/skills` 目录并批量导入
- 本地客户端可直接读取 `.cursor/skills` 并展示
- 本地客户端可向 Web 发起批量上传并查看同步结果

2. 质量验收
- 关键接口有错误码与明确报错信息
- 上传、编辑、下载链路均有基础日志
- 前端关键交互有 loading/error/empty 态

3. 安全验收
- 未登录不能执行写操作
- 非法 Frontmatter 会被拦截
- Markdown 预览无脚本注入风险

---

## 11. 测试清单（建议）

1. 单元测试
- `skillParser` frontmatter 解析
- `name/description` 校验规则
- 已补充可执行脚本：`pnpm run test:skill-manager:validation`

2. 集成测试
- 上传 -> 建档 -> 预览 -> 编辑 -> 下载全链路
- 批量导入 20+ Skill 的稳定性
- 同步任务中心：创建任务 -> 查询进度 -> 重试失败项

3. 手工测试
- 中文/英文/超长 description
- 重名 Skill 导入冲突策略
- 上传中断恢复与失败重试

---

## 12. 风险与对策

1. 浏览器无法直接读取任意本地路径
- 对策：MVP 用目录选择器；后续引入本地桥接

2. Skill 目录结构不规范
- 对策：导入预检查 + 可视化错误报告（哪些目录缺 `SKILL.md`）

3. 大目录上传耗时长
- 对策：分批上传、并发队列、进度可视化、失败重试

---

## 13. 实施建议（你这次需求的落地结论）

1. 在 `profile-v1` 同步推进双端：Web 后台 + Desktop 客户端。
2. Web 先落地 `skillManager` 核心能力与同步 API，复用现有 `universal-file` 上传链路。
3. Desktop 首版聚焦“本地读取 + 批量上传 + 同步结果回显”。
4. 第一版形成“本地管理 + 在线管理 + 上传同步”的最小闭环，再迭代双向同步与冲突策略。

---

## 14. 子任务拆解（可直接排期）

> 目标：按“先打通主链路，再补增强能力”的方式推进，确保每个阶段都有可演示成果。

### 14.1 Web 前端（profile-v1）

1. 模块骨架与路由
- [ ] 新建 `src/modules/skillManager/` 基础目录与 `index.ts`
- [ ] 新建页面 `SkillManagerPage.tsx`
- [ ] 注册路由 `src/app/(pages)/testField/(utility)/skillManager/page.tsx`
- [ ] 在 `experimentData` 中注册入口

2. 列表与详情
- [ ] 实现 Skill 列表（搜索、筛选、分页）
- [ ] 实现详情抽屉（基础信息 + 文件树）
- [ ] 实现 `SKILL.md` Markdown/源码双视图预览

3. 编辑能力
- [ ] 实现 frontmatter 结构化表单编辑（name/description）
- [ ] 实现原文编辑器（`SKILL.md`）
- [ ] 接入保存前校验与错误提示

4. 上传与下载
- [ ] 接入单文件上传（`SKILL.md`）
- [ ] 接入目录上传（浏览器目录选择）
- [ ] 接入单个下载（zip）
- [ ] 预留批量下载 UI（V2）

---

### 14.2 Electron 客户端（Desktop）

1. 客户端工程初始化
- [ ] 初始化 Electron 主进程 + 渲染进程项目结构
- [ ] 配置本地存储（任务状态、最近同步记录）
- [ ] 配置环境（Web API 地址、认证信息注入）

2. 本地 Skill 管理
- [ ] 扫描 `~/.cursor/skills` 并构建目录树
- [ ] 解析 `SKILL.md` frontmatter（name/description）
- [ ] 本地列表展示（状态、更新时间、文件数）
- [ ] 本地详情预览（Markdown + 文件树）

3. 本地编辑
- [ ] 编辑 `SKILL.md`（结构化 + 原文）
- [ ] 本地保存与校验（命名规则、description 长度）
- [ ] 变更标记（未同步/已同步/冲突）

4. 上传与同步
- [ ] 单个 Skill 上传到 Web
- [ ] 批量上传（队列 + 并发控制）
- [ ] 同步任务中心（进度、失败项、重试）
- [ ] 首版冲突策略：`ff-only` + `manual`

---

### 14.3 后端 API（skill-manager）

1. 资源管理 API
- [ ] `GET /skills` 列表查询（分页、筛选）
- [ ] `POST /skills` 新建 Skill
- [ ] `GET /skills/:id` 详情
- [ ] `PUT /skills/:id` 元数据更新
- [ ] `PUT /skills/:id/content` 内容更新

2. 文件管理 API
- [ ] `POST /skills/:id/files` 关联上传文件
- [ ] `GET /skills/:id/download` 单个下载打包
- [ ] `POST /skills/batch-download`（V2）

3. 同步 API
- [ ] `POST /sync/tasks` 创建任务
- [ ] `GET /sync/tasks/:taskId` 查询进度
- [ ] `POST /sync/tasks/:taskId/retry` 重试失败项
- [ ] 保存 `base/local/remote snapshot` 元数据

4. 通用上传链路对接
- [ ] 复用 `/api/universal-file/upload`
- [ ] 统一 `moduleId=skill-manager`
- [ ] 上传结果与 Skill 文件记录绑定

---

### 14.4 同步引擎（核心逻辑）

1. 快照与比对
- [ ] 定义 Skill 快照结构（目录 + 文件 hash）
- [ ] 生成 `base/local/remote` 三方快照
- [ ] 变更分类（新增/修改/删除）

2. 冲突判定
- [ ] 实现 fast-forward 判定
- [ ] 实现 diverged 判定
- [ ] 输出冲突文件清单与原因

> MVP 实现说明（Web 端）：
- 已基于 `base/local/remote` 的 `SKILL.md` hash 执行 `ff-only/manual` 判定
- `ff-only`：仅允许 no-op 与 fast-forward；behind/diverged 直接失败
- `manual`：behind/diverged 标记为“需手工决策”，并在任务项中返回冲突原因
- 已提供 `manual` 冲突处理面板（MVP）：可对失败项选择 `local/remote` 并应用；`merge_edit` 为占位流程
- `merge_edit` 已升级为可执行：可在冲突面板填写合并后的 `SKILL.md` 内容并直接应用

3. 策略执行
- [ ] MVP：`ff-only`
- [ ] MVP：`manual`（用户逐文件选择）
- [ ] V2：`rebase-local`
- [ ] V2：`merge-auto`

4. 可观测性
- [ ] 任务日志（开始、完成、失败、重试）
- [ ] 指标埋点（成功率、平均耗时、冲突率）

> MVP 实现说明（Web 端）：
- 已记录任务日志（创建、重试、冲突决策）
- 已在任务返回中提供指标：`durationMs/successRate/conflictRate`

---

### 14.5 测试任务

1. 单元测试
- [ ] frontmatter 解析器
- [ ] 命名/描述校验器
- [ ] 快照 diff 计算器

2. 集成测试
- [ ] 本地扫描 -> 批量上传 -> Web 可见
- [ ] 编辑后同步 -> 版本更新
- [ ] 冲突触发 -> 手工解决 -> 重试成功

3. 端到端测试（E2E）
- [ ] Electron 登录/配置 API 地址
- [ ] 选择本地目录并全量上传
- [ ] Web 端预览/下载验证

---

## 15. 任务依赖关系（执行顺序）

1. P0 基础依赖
- [ ] 后端 Skill 基础 API（列表/详情/更新）
- [ ] Web 模块骨架 + 路由
- [ ] Electron 工程初始化 + 本地扫描

2. P1 主链路打通（必须先完成）
- [ ] Electron 扫描本地目录
- [ ] Electron 批量上传（调用后端 + 通用文件上传）
- [ ] Web 列表/详情可见上传结果

3. P2 闭环能力
- [ ] Web 编辑并保存
- [ ] Web 下载单个 Skill
- [ ] Electron 同步任务中心（状态+重试）

4. P3 冲突与增强
- [ ] `ff-only` 冲突拦截
- [ ] `manual` 冲突处理面板
- [ ] 批量下载 + rebase/merge 策略（V2）

---

## 16. 两周冲刺建议（示例）

### Week 1
- Day 1-2：后端基础 API + 数据模型
- Day 3：Web 列表/详情/预览
- Day 4：Electron 扫描 + 本地列表
- Day 5：上传链路联调（Electron -> Web）

### Week 2
- Day 1：Web 编辑保存 + 校验
- Day 2：下载能力 + 打包
- Day 3：同步任务中心（MVP）
- Day 4：冲突策略 `ff-only/manual`
- Day 5：联测、修复、演示验收
