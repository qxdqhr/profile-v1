# ST-08 Mission 编辑器

**任务 ID**：T-08  
**状态**：pending  
**依赖**：ST-04, ST-05

## 目标

图形化编辑 `MISSION.md`，与 teach skill 格式对齐。

## 交付物

- [ ] `components/MissionEditor.tsx` — 分段表单
- [ ] `pages/MissionPage.tsx`
- [ ] `utils/missionParser.ts` — MD ↔ 结构化对象
- [ ] `app/.../teachHub/w/[workspaceId]/mission/page.tsx`

## MISSION 字段（对齐 teach skill）

| 段落 | 表单字段 |
|------|---------|
| Why | textarea |
| Success looks like | 动态列表（每行一条） |
| Constraints | 动态列表 |
| Out of scope | 动态列表 |

## 读写流程

1. GET `files/MISSION.md` → parse → 表单
2. Save → compose MD → PUT `files/MISSION.md`
3. PATCH workspace `mission_summary`（Why 首段缓存）

## 验收标准

1. 编辑保存后 OSS 文件更新
2. 工作区主页 Mission 摘要同步
3. 空工作区有默认 MISSION 模板可编辑

## 子步骤

1. missionParser（解析现有 musicStudy MISSION.md 做测试）
2. MissionEditor UI
3. MissionPage 路由
4. 与工作区主页联动
