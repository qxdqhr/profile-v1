# ST-03 OSS 文件层

**任务 ID**：T-03  
**状态**：done  
**依赖**：ST-01

## 目标

封装 teachHub 工作区的 OSS 读写，复用 skill-manager 文件存储模式，按 `userId/workspaceId` 隔离。

## 交付物

- [x] `services/teachHubFileStore.ts`
- [x] `utils/teachWorkspacePaths.ts` — 路径拼接与校验
- [x] `utils/workspaceValidator.ts` — zip / 目录契约校验
- [x] `utils/lessonIndex.ts` — 课时列表解析
- [x] `utils/workspaceTemplates.ts` — 空工作区默认文件

## API 表面（内部）

```ts
listWorkspaceFiles(userId, workspaceId): Promise<TeachStoredFile[]>
getFileText(userId, workspaceId, relativePath): Promise<string>
putFileText(userId, workspaceId, relativePath, content): Promise<{ fileId }>
importWorkspaceZip(userId, workspaceId, zipBuffer): Promise<ImportResult>
listLessons(userId, workspaceId): Promise<LessonIndex[]>
buildWorkspaceZip(userId, workspaceId): Promise<Buffer>  // Phase 3
```

## 路径常量

```
MODULE_ID = 'teach-hub'
businessId = `${userId}/${workspaceId}`
customPath = `teach-hub/${userId}/${workspaceId}/${relativePath}`
```

## 参考代码

- `src/app/api/skill-manager/_fileStore.ts`

## 实现要点

1. **禁止**客户端传入 `userId`，由 service 参数强制
2. `relativePath` 消毒：无 `..`、无 leading `/`
3. `listLessons`：扫描 `lessons/`，解析 `NNNN-slug.html`
4. zip 导入：解压后逐文件 `putFileText`，跳过 `__MACOSX` 等
5. 导入后调用 validator：警告缺 MISSION、无 lessons 等

## 验收标准

1. 上传 `musicStudy` zip 后，OSS 存在 6+ 文件
2. `getFileText(..., 'lessons/0001-sound-and-pitch.html')` 返回完整 HTML
3. 用户 A 的 path 无法通过改 workspaceId 读到用户 B 文件（在 API 层测）

## 子步骤

1. 复制 _fileStore 模式，改 MODULE_ID 与 businessId
2. 实现 list / get / put
3. 实现 zip import（adm-zip，项目已有依赖）
4. 实现 workspaceValidator + lesson 索引解析
