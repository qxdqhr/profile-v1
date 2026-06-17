# ST-16 teach-hub 入口切换与兼容

**任务 ID**：M-16  
**状态**：pending  
**依赖**：M-15

## 目标

用户入口迁至 teach-hub 子应用，清理 web 遗留。

## 交付物

- [ ] 产品 URL：`/teach-hub` 或 `teach.{domain}`
- [ ] `experimentData.ts` path 更新
- [ ] web 内 `/testField/teachHub` 302 或反代
- [ ] 删除 web 内 `src/modules/teachHub` 与 `/api/teach-hub`
- [ ] 环境变量文档：`NEXT_PUBLIC_TEACH_HUB_BASE_URL`

## OSS / 已有数据

- 已存在 `teach-hub/{userId}/{workspaceId}/` **无需迁移**
- DB 表 `teach_hub_*` 不变

## 验收标准

1. 实验田 → teachHub 全流程
2. 旧书签 `/testField/teachHub/...` 可访问（重定向）
3. web build 不再包含 teachHub 代码

## 文档

- 更新 `packages/teach-hub-core/README.md`
