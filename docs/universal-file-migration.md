# UniversalFile 迁移到 sa2kit 方案

## 目标
将 `profile-v1` 中的文件上传相关代码统一封装到 `sa2kit/universalFile` 模块中,实现代码复用和统一维护。

## 当前状态

### profile-v1 现有代码
- `src/services/universalFile/UniversalFileService.ts` - 完整的服务类(1017行)
- `src/services/universalFile/providers/` - OSS和Local存储提供者  
- `src/services/universalFile/config/` - 配置管理(含数据库配置加载)
- `src/services/universalFile/db/` - 数据库 schema 和服务
- `src/app/api/universal-file/upload/route.ts` - 通用文件上传API
- `src/app/api/mmd/upload/models/route.ts` - MMD专用上传API

### sa2kit 现有代码  
- `src/universalFile/server/UniversalFileService.ts` - 简化版服务类(608行)
- `src/universalFile/server/providers/` - OSS和Local存储提供者
- `src/universalFile/server/types.ts` - 完整类型定义
- `src/universalFile/server/persistence/drizzle-repository.ts` - 数据库持久化适配器

## 迁移策略

### 阶段1: 补全 sa2kit 中缺失的方法 ✅ 正在进行
1. 在 `sa2kit/universalFile/server/UniversalFileService.ts` 中添加:
   - `downloadFile()` - 文件下载
   - `deleteFile()` - 文件删除  
   - `getFileUrl()` - 获取访问URL
   - `getFileMetadata()` - 获取文件元数据
   - `queryFiles()` - 查询文件列表
   - `batchDeleteFiles()` - 批量删除

2. 补全数据库操作方法 (使用持久化仓储):
   - `saveFileMetadata()` - 保存到数据库
   - `getFileMetadata()` - 从数据库查询
   - `deleteFileMetadata()` - 从数据库删除
   - `updateAccessStats()` - 更新访问统计

### 阶段2: 创建数据库适配器 ✅ 待执行
在 `profile-v1` 中创建:
- `src/services/universalFile/adapters/drizzleAdapter.ts`
- 实现 `IFileMetadataRepository` 接口
- 复用现有的 `db/schema.ts` 和 `db/services/fileDbService.ts`

### 阶段3: 更新 profile-v1 API 路由 ✅ 待执行  
修改以下文件使用 `sa2kit/universalFile/server`:
- `src/app/api/universal-file/upload/route.ts`
- `src/app/api/universal-file/[fileId]/route.ts`
- 保留 `src/services/universalFile/config/` (配置管理器)
- 删除 `src/services/universalFile/UniversalFileService.ts`

### 阶段4: 整合 MMD 上传 ✅ 待执行
- 将 `src/app/api/mmd/upload/models/route.ts` 中的上传逻辑整合到 `sa2kit/mmd/server`
- 使用 `sa2kit/universalFile/server` 的 `UniversalFileService` 进行实际上传
- 保留 MMD 特有的 ZIP 处理逻辑

### 阶段5: 测试验证 ✅ 待执行
- 测试通用文件上传功能
- 测试 MMD 模型上传功能
- 验证数据库持久化
- 验证 OSS 上传

## 代码示例

### 使用方式 (profile-v1)

```typescript
// src/app/api/universal-file/upload/route.ts
import { UniversalFileService } from 'sa2kit/universalFile/server';
import { createFileServiceConfigWithConfigManager } from '@/services/universalFile/config';
import { createDrizzleFileRepository } from '@/services/universalFile/adapters/drizzleAdapter';

export async function POST(request: NextRequest) {
  // 1. 加载配置 (保留现有配置管理器,因为它集成了 EnvConfigService)
  const configManager = await createFileServiceConfigWithConfigManager();
  const config = configManager.getConfig();
  
  // 2. 创建数据库持久化仓储
  const repository = createDrizzleFileRepository();
  
  // 3. 转换配置格式并创建服务
  const fileService = new UniversalFileService({
    storage: config.storageProviders[config.defaultStorage],
    cdn: config.cdnProviders[config.defaultCDN],
    maxFileSize: config.maxFileSize,
    allowedMimeTypes: config.allowedMimeTypes,
    cache: {
      enabled: true,
      metadataTTL: config.cache.metadataTTL,
      urlTTL: config.cache.urlTTL,
    },
    persistence: {
      enabled: true,
      repository,
      autoPersist: true,
    },
    // 额外字段用于兼容旧的配置结构
    defaultStorage: config.defaultStorage,
    defaultCDN: config.defaultCDN,
    storageProviders: config.storageProviders,
  });
  
  await fileService.initialize();
  
  // 4. 使用服务上传文件
  const metadata = await fileService.uploadFile(uploadInfo);
  
  return NextResponse.json({ success: true, data: metadata });
}
```

## 优点

1. **统一维护**: 所有核心上传逻辑在 `sa2kit` 中维护
2. **可复用**: 其他项目可以直接使用 `sa2kit/universalFile`
3. **灵活配置**: `profile-v1` 保留自己的配置管理器,可以从数据库加载配置
4. **渐进式迁移**: 可以逐步迁移,不影响现有功能

## 下一步

1. 完善 `sa2kit/universalFile/server/UniversalFileService.ts`
2. 创建 `profile-v1` 的数据库适配器
3. 更新 API 路由
4. 测试验证

