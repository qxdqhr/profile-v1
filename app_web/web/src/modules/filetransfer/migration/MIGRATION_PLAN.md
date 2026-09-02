# FileTransfer模块迁移计划

## 🎯 迁移目标

将现有的fileTransfer模块完全改造为使用通用文件服务，保持API兼容性的同时提升功能和性能。

## 📊 现状分析

### 当前fileTransfer模块架构
```
fileTransfer/
├── api/                    # API路由
│   ├── transfers/         # 文件传输CRUD
│   ├── download/          # 文件下载
│   ├── config/           # 配置管理
│   └── collections/      # 文件集合（未详细分析）
├── components/           # 前端组件
│   ├── FileTransferCard  # 文件卡片
│   └── FileUploader      # 文件上传器
├── db/                   # 数据库层
│   ├── schema.ts        # 数据表定义
│   └── fileTransferDbService.ts # 数据库服务
├── services/            # 业务逻辑
│   └── fileTransferService.ts # 文件传输服务
├── types/               # 类型定义
└── pages/              # 页面组件
```

### 现有数据表结构
```sql
file_transfers (
  id TEXT PRIMARY KEY,
  fileName TEXT NOT NULL,
  fileType TEXT NOT NULL, 
  fileSize INTEGER NOT NULL,
  filePath TEXT NOT NULL,
  uploaderId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  downloadCount INTEGER NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  expiresAt TIMESTAMP
)
```

### 功能清单
- ✅ 文件上传（本地存储）
- ✅ 文件下载
- ✅ 文件列表查询
- ✅ 文件删除
- ✅ 用户权限控制
- ✅ 配置管理
- ✅ 前端文件管理界面

## 🚀 迁移策略

### 阶段1：数据迁移脚本
1. **分析现有数据**：统计当前file_transfers表中的数据
2. **字段映射**：将旧表字段映射到通用文件服务表
3. **数据迁移**：批量迁移现有文件记录
4. **文件迁移**：将本地存储文件上传到OSS
5. **数据验证**：确保迁移数据的完整性

### 阶段2：后端服务改造
1. **服务层重构**：使用UniversalFileService替换fileTransferDbService
2. **API兼容**：保持现有API接口不变
3. **配置集成**：将fileTransfer配置集成到通用服务
4. **错误处理**：统一错误处理机制

### 阶段3：前端组件升级
1. **组件重构**：使用通用文件组件
2. **UI优化**：集成新的文件管理界面
3. **性能提升**：利用CDN加速和缓存
4. **功能增强**：添加预览、分享等新功能

### 阶段4：测试和优化
1. **兼容性测试**：确保现有功能正常
2. **性能测试**：对比迁移前后的性能
3. **用户测试**：验证用户体验
4. **监控配置**：配置性能监控

## 📋 详细迁移步骤

### 步骤1：数据分析和准备

#### 1.1 分析现有数据
```sql
-- 统计现有文件数量
SELECT COUNT(*) as total_files FROM file_transfers;

-- 按状态统计
SELECT status, COUNT(*) as count FROM file_transfers GROUP BY status;

-- 按文件类型统计
SELECT fileType, COUNT(*) as count FROM file_transfers GROUP BY fileType;

-- 计算总文件大小
SELECT SUM(fileSize) as total_size FROM file_transfers;
```

#### 1.2 数据映射表
| 旧表字段 | 新表字段 | 映射关系 | 备注 |
|---------|---------|---------|------|
| id | file_metadata.id | 直接映射 | 保持原ID |
| fileName | file_metadata.original_name | 直接映射 | 原始文件名 |
| fileType | file_metadata.mime_type | 直接映射 | MIME类型 |
| fileSize | file_metadata.size | 直接映射 | 文件大小 |
| filePath | file_metadata.storage_path | 转换映射 | 需要上传到OSS |
| uploaderId | file_metadata.uploader_id | 直接映射 | 上传者ID |
| status | 无直接对应 | 逻辑映射 | 通过is_temporary等字段表示 |
| progress | 无直接对应 | 忽略 | 迁移时都是完成状态 |
| downloadCount | file_metadata.download_count | 直接映射 | 下载次数 |
| createdAt | file_metadata.upload_time | 直接映射 | 上传时间 |
| updatedAt | file_metadata.updated_at | 直接映射 | 更新时间 |
| expiresAt | file_metadata.expires_at | 直接映射 | 过期时间 |

### 步骤2：创建迁移工具类

#### 2.1 FileTransferMigrator类功能
- 批量读取现有file_transfers数据
- 文件完整性验证
- OSS上传和元数据创建
- 迁移进度跟踪
- 错误处理和回滚

#### 2.2 迁移配置
```typescript
interface MigrationConfig {
  batchSize: number;           // 批处理大小
  enableOSSUpload: boolean;    // 是否上传到OSS
  validateFiles: boolean;      // 是否验证文件完整性
  backupOldData: boolean;      // 是否备份原数据
  dryRun: boolean;            // 是否试运行
}
```

### 步骤3：服务层改造

#### 3.1 FileTransferService重构
```typescript
// 旧版本
class FileTransferService {
  async uploadFile(file: File, userId: string): Promise<FileTransfer>
  async getUserTransfers(userId: string, options): Promise<FileTransfer[]>
  async deleteTransfer(id: string, userId: string): Promise<void>
}

// 新版本 - 基于UniversalFileService
class FileTransferService {
  private universalFileService: UniversalFileService;
  
  async uploadFile(file: File, userId: string): Promise<FileTransfer> {
    // 使用通用服务上传
    const fileMetadata = await this.universalFileService.uploadFile({
      file,
      moduleId: 'filetransfer',
      uploaderId: userId,
      // 其他参数...
    });
    
    // 转换为FileTransfer格式返回
    return this.mapToFileTransfer(fileMetadata);
  }
}
```

#### 3.2 API兼容性保证
- 保持现有API路径不变
- 响应格式保持兼容
- 错误代码保持一致
- 添加新功能的可选参数

### 步骤4：前端组件升级

#### 4.1 组件重构计划
```typescript
// FileUploader组件升级
// 旧版本：直接调用fileTransfer API
// 新版本：使用UniversalFileUploader组件

// FileTransferCard组件升级  
// 新增：文件预览功能
// 新增：分享功能
// 新增：更多操作选项

// FileTransferPage页面升级
// 优化：使用新的文件管理界面
// 新增：批量操作功能
// 新增：搜索和过滤功能
```

#### 4.2 UI/UX改进
- 更好的上传进度显示
- 文件预览支持
- 拖拽上传
- 批量操作
- 响应式设计优化

### 步骤5：测试策略

#### 5.1 数据迁移测试
- [ ] 迁移前后数据量对比
- [ ] 文件完整性验证
- [ ] 权限验证
- [ ] 性能对比

#### 5.2 功能测试
- [ ] 文件上传功能
- [ ] 文件下载功能
- [ ] 文件删除功能
- [ ] 权限控制
- [ ] 配置管理

#### 5.3 兼容性测试
- [ ] API响应格式
- [ ] 错误处理
- [ ] 现有客户端兼容性

#### 5.4 性能测试
- [ ] 上传速度对比
- [ ] 下载速度对比
- [ ] 列表查询性能
- [ ] 并发处理能力

## ⚠️ 风险评估

### 高风险项
1. **数据丢失风险**：迁移过程中可能导致数据丢失
   - 缓解措施：完整备份、分批迁移、回滚机制

2. **API兼容性风险**：新API可能与现有客户端不兼容
   - 缓解措施：保持API接口不变、充分测试

3. **性能下降风险**：新架构可能影响性能
   - 缓解措施：性能对比测试、优化配置

### 中风险项
1. **文件迁移失败**：部分文件可能迁移失败
   - 缓解措施：错误重试、手动处理机制

2. **用户体验变化**：界面改动可能影响用户习惯
   - 缓解措施：渐进式升级、用户指引

### 低风险项
1. **配置不兼容**：配置参数可能需要调整
   - 缓解措施：配置映射、默认值设置

## 🔄 回滚计划

### 数据回滚
1. 恢复原file_transfers表
2. 恢复本地文件存储
3. 切换回旧版服务

### 代码回滚
1. Git版本回滚
2. 重新部署旧版本
3. 恢复配置文件

## 📈 成功指标

### 数据指标
- [ ] 100%数据迁移成功率
- [ ] 0%数据丢失率
- [ ] 文件完整性验证通过率100%

### 性能指标
- [ ] 上传速度提升30%+
- [ ] 下载速度提升50%+（CDN加速）
- [ ] API响应时间<500ms

### 功能指标
- [ ] 100%原有功能兼容
- [ ] 新增功能正常工作
- [ ] 错误率<1%

### 用户体验指标
- [ ] 页面加载时间<2s
- [ ] 用户操作流程无变化
- [ ] 新功能使用率>10%

## 📅 时间计划

### 第1天：数据分析和迁移脚本
- [ ] 分析现有数据结构
- [ ] 创建迁移工具类
- [ ] 编写数据迁移脚本
- [ ] 本地环境测试

### 第2天：后端服务改造
- [ ] 重构FileTransferService
- [ ] 更新API路由实现
- [ ] 配置通用文件服务
- [ ] 单元测试

### 第3天：前端组件升级和集成测试
- [ ] 升级前端组件
- [ ] 集成测试
- [ ] 性能测试
- [ ] 文档更新

这个迁移计划确保了数据的安全性、功能的兼容性和用户体验的平滑过渡。 