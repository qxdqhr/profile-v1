# OSS 文件存储数据库配置指南

## 📋 概述

通用文件服务（Universal File Service）已经集成了完整的数据库支持，用于存储和管理上传到 OSS 的文件元数据。

## 🗄️ 数据库表结构

### 核心表

#### 1. `file_storage_providers` - 存储提供者配置表
存储不同的文件存储提供者配置（OSS、本地存储等）。

```sql
CREATE TABLE file_storage_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,  -- 'aliyun-oss', 'local', etc.
  config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 100,
  max_file_size BIGINT,
  supported_mime_types JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### 2. `file_metadata` - 文件元数据主表
存储所有上传文件的完整元数据信息。

```sql
CREATE TABLE file_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name VARCHAR(500) NOT NULL,
  stored_name VARCHAR(500) NOT NULL,
  extension VARCHAR(20),
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  md5_hash VARCHAR(32) NOT NULL,
  sha256_hash VARCHAR(64),
  storage_provider_id INTEGER NOT NULL,
  storage_path TEXT NOT NULL,         -- OSS 存储路径
  cdn_url TEXT,                       -- CDN 加速 URL
  folder_id UUID,
  module_id VARCHAR(100),             -- 'mmd', 'images', etc.
  business_id VARCHAR(255),           -- 业务关联 ID
  tags JSONB,
  metadata JSONB,                     -- 额外的元数据（如图片尺寸等）
  is_temporary BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  access_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  uploader_id VARCHAR(255) NOT NULL,
  upload_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_access_time TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

#### 3. `file_folders` - 文件夹表
支持层级结构的文件夹管理。

```sql
CREATE TABLE file_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID,
  module_id VARCHAR(100),
  business_id VARCHAR(255),
  path TEXT NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## 🚀 初始化数据库

### 步骤 1：生成迁移文件（如果需要）

```bash
# 开发环境
pnpm devdb:generate

# 生产环境
pnpm prodb:generate
```

### 步骤 2：推送到数据库

```bash
# 开发环境
pnpm devdb:push

# 生产环境
pnpm prodb:push
```

### 步骤 3：运行迁移（如果有自定义迁移）

```bash
# 开发环境
pnpm devdb:migrate

# 生产环境
pnpm prodb:migrate
```

### 步骤 4：验证表是否创建成功

使用 Drizzle Studio 查看：

```bash
# 开发环境
pnpm devdb:studio

# 生产环境
pnpm prodb:studio
```

访问 `http://localhost:3500` 查看数据库。

## 📊 数据流程

### 文件上传流程

```
1. 用户上传文件
   ↓
2. UniversalFileService.uploadFile()
   ↓
3. 文件上传到 OSS (AliyunOSSProvider)
   ↓
4. 保存文件元数据到数据库 (file_metadata 表)
   ↓
5. 返回文件信息（包含 OSS URL 和数据库 ID）
```

### 数据库记录示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "original_name": "miku.pmx",
  "stored_name": "550e8400-e29b-41d4-a716-446655440000.pmx",
  "extension": "pmx",
  "mime_type": "application/octet-stream",
  "size": 2345678,
  "md5_hash": "5d41402abc4b2a76b9719d911017c592",
  "storage_provider_id": 1,
  "storage_path": "mmd/2025/11/24/miku/miku.pmx",
  "cdn_url": "https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/mmd/2025/11/24/miku/miku.pmx",
  "module_id": "mmd",
  "business_id": "resources",
  "tags": ["model", "vocaloid", "miku"],
  "metadata": {
    "type": "model",
    "category": "character"
  },
  "is_temporary": false,
  "is_deleted": false,
  "access_count": 10,
  "download_count": 5,
  "uploader_id": "user_123",
  "upload_time": "2025-11-24T10:00:00Z"
}
```

## 🔍 查询示例

### 查询所有 MMD 资源

```typescript
import { db } from '@/db';
import { fileMetadata } from '@/services/universalFile/db/schema';
import { eq, and } from 'drizzle-orm';

// 查询所有 MMD 模型
const mmdModels = await db
  .select()
  .from(fileMetadata)
  .where(
    and(
      eq(fileMetadata.moduleId, 'mmd'),
      eq(fileMetadata.isDeleted, false)
    )
  );
```

### 按文件类型查询

```typescript
// 查询所有 .pmx 模型文件
const pmxModels = await db
  .select()
  .from(fileMetadata)
  .where(
    and(
      eq(fileMetadata.extension, 'pmx'),
      eq(fileMetadata.isDeleted, false)
    )
  );
```

### 查询最近上传的文件

```typescript
import { desc } from 'drizzle-orm';

// 查询最近 10 个上传的文件
const recentFiles = await db
  .select()
  .from(fileMetadata)
  .where(eq(fileMetadata.isDeleted, false))
  .orderBy(desc(fileMetadata.uploadTime))
  .limit(10);
```

### 统计文件大小

```typescript
import { sum } from 'drizzle-orm';

// 统计 MMD 模块的总文件大小
const totalSize = await db
  .select({ total: sum(fileMetadata.size) })
  .from(fileMetadata)
  .where(
    and(
      eq(fileMetadata.moduleId, 'mmd'),
      eq(fileMetadata.isDeleted, false)
    )
  );
```

## 🎯 使用场景

### 1. **MMD 资源管理**
```typescript
// 查询所有 MMD 资源并按类型分类
const mmdResources = await db
  .select()
  .from(fileMetadata)
  .where(
    and(
      eq(fileMetadata.moduleId, 'mmd'),
      eq(fileMetadata.isDeleted, false)
    )
  );

const grouped = {
  models: mmdResources.filter(f => ['pmx', 'pmd'].includes(f.extension || '')),
  motions: mmdResources.filter(f => f.extension === 'vmd'),
  audios: mmdResources.filter(f => ['wav', 'mp3', 'ogg'].includes(f.extension || '')),
  textures: mmdResources.filter(f => ['png', 'jpg', 'bmp'].includes(f.extension || '')),
};
```

### 2. **文件去重**
```typescript
// 检查文件是否已存在（基于 MD5）
async function checkFileExists(md5Hash: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(fileMetadata)
    .where(
      and(
        eq(fileMetadata.md5Hash, md5Hash),
        eq(fileMetadata.isDeleted, false)
      )
    )
    .limit(1);
  
  return existing.length > 0;
}
```

### 3. **访问统计**
```typescript
// 增加文件访问次数
async function incrementAccessCount(fileId: string) {
  await db
    .update(fileMetadata)
    .set({
      accessCount: sql`${fileMetadata.accessCount} + 1`,
      lastAccessTime: new Date(),
    })
    .where(eq(fileMetadata.id, fileId));
}
```

### 4. **临时文件清理**
```typescript
// 清理过期的临时文件
async function cleanExpiredTempFiles() {
  const expiredFiles = await db
    .select()
    .from(fileMetadata)
    .where(
      and(
        eq(fileMetadata.isTemporary, true),
        lt(fileMetadata.expiresAt, new Date())
      )
    );

  // 软删除
  for (const file of expiredFiles) {
    await db
      .update(fileMetadata)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(fileMetadata.id, file.id));
  }
}
```

## 🔐 安全注意事项

### 1. **软删除**
- 文件删除使用软删除（`is_deleted = true`）
- 不立即从 OSS 删除文件
- 可以定期清理真正删除的文件

### 2. **权限控制**
- `uploader_id` 记录上传者
- 可以实现基于用户的文件访问控制

### 3. **完整性校验**
- 使用 MD5 和 SHA256 哈希值
- 可以验证文件完整性
- 支持文件去重

## 📈 性能优化

### 索引

数据库已创建以下索引：

```sql
-- MD5 哈希索引（用于去重）
CREATE INDEX file_metadata_md5_idx ON file_metadata(md5_hash);

-- 模块索引（快速查询某个模块的文件）
CREATE INDEX file_metadata_module_idx ON file_metadata(module_id);

-- 业务 ID 索引
CREATE INDEX file_metadata_business_idx ON file_metadata(business_id);

-- 上传者索引
CREATE INDEX file_metadata_uploader_idx ON file_metadata(uploader_id);

-- MIME 类型索引
CREATE INDEX file_metadata_mime_type_idx ON file_metadata(mime_type);
```

### 查询优化

```typescript
// ✅ 好的做法：使用索引字段
const files = await db
  .select()
  .from(fileMetadata)
  .where(eq(fileMetadata.moduleId, 'mmd'));  // 使用了索引

// ❌ 避免：不使用索引的模糊查询
const files = await db
  .select()
  .from(fileMetadata)
  .where(like(fileMetadata.originalName, '%miku%'));  // 全表扫描
```

## 🔧 故障排查

### 问题 1：表不存在

**错误：** `relation "file_metadata" does not exist`

**解决方案：**
```bash
# 运行数据库迁移
pnpm devdb:push
```

### 问题 2：外键约束错误

**错误：** `violates foreign key constraint "file_metadata_storage_provider_id_fkey"`

**解决方案：**
```typescript
// 确保存储提供者已经在数据库中注册
// UniversalFileService 初始化时会自动注册
```

### 问题 3：文件未保存到数据库

**原因：** UniversalFileService 初始化失败

**解决方案：**
```typescript
// 检查数据库连接
import { getDatabaseConnectionStatus } from '@/db';

const status = await getDatabaseConnectionStatus();
console.log('数据库状态:', status);
```

## 📚 相关文档

- [通用文件服务 API 文档](../src/services/universalFile/README.md)
- [MMD 资源上传指南](./mmd-resource-upload-guide.md)
- [OSS CORS 配置指南](./oss-cors-setup.md)
- [OSS 路径配置指南](./mmd-oss-path-guide.md)

## 🎯 总结

✅ **数据库表结构已就绪** - `file_metadata`, `file_folders`, `file_storage_providers`  
✅ **自动保存元数据** - `UniversalFileService.uploadFile()` 自动保存到数据库  
✅ **完整的查询支持** - 可以按模块、类型、上传者等查询  
✅ **性能优化** - 已创建必要的索引  
✅ **安全可靠** - 软删除、完整性校验、去重支持  

**数据库已经集成完毕，无需额外配置！** 🎉

