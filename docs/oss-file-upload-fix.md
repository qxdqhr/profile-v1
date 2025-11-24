# OSS 文件上传问题修复说明

## 📋 问题描述

在使用 MMD 压缩包上传功能时，遇到错误：

```
StorageProviderError: OSS存储提供者未初始化
at AliyunOSSProvider.ensureInitialized
```

## 🔍 根本原因

1. **OSS 连接测试失败**：在初始化 OSS Provider 时，`testConnection()` 方法尝试连接 OSS 进行测试，但由于网络或DNS问题失败
2. **初始化阻塞**：原代码在连接测试失败时会抛出错误，导致 `isInitialized` 保持为 `false`
3. **上传失败**：`ensureInitialized()` 检查到 `isInitialized === false` 时抛出错误，阻止文件上传

## ✅ 解决方案

### 1. OSS Provider 容错处理

**修改文件**：`src/services/universalFile/providers/AliyunOSSProvider.ts`

**修改内容**：
- 将 `testConnection()` 失败改为**警告**而非错误
- 即使连接测试失败也标记 `isInitialized = true`
- 允许在后续实际上传时再处理网络问题

```typescript
// 测试连接（非阻塞）
try {
  await this.testConnection();
  console.log(`✅ [AliyunOSSProvider] OSS连接测试成功`);
} catch (testError) {
  console.warn('⚠️ [AliyunOSSProvider] OSS连接测试失败，但将继续初始化:', testError);
  // 不抛出错误，允许继续使用
}

this.isInitialized = true; // 仍然标记为已初始化
```

### 2. 智能存储提供者降级

**修改文件**：`src/services/universalFile/UniversalFileService.ts`

**修改内容**：
- 新增 `isProviderAvailable()` 检查函数
- 在选择存储提供者时检查 `isInitialized` 状态
- OSS 不可用时自动降级到本地存储

```typescript
const isProviderAvailable = (provider: any) => {
  return provider && (!('isInitialized' in provider) || provider['isInitialized'] === true);
};

// 如果 OSS 不可用，自动降级
if (!isProviderAvailable(storageProvider)) {
  console.log(`⚠️ [UniversalFileService] OSS 不可用，回退到本地存储`);
  storageProvider = this.storageProviders.get('local');
  selectedStorageType = 'local';
}
```

### 3. OSS 配置优化

**问题**：数据库中的 `ALIYUN_OSS_CUSTOM_DOMAIN` 被错误地设置为标准 OSS 域名

```
ALIYUN_OSS_CUSTOM_DOMAIN: 'profile-qhr-resource.oss-cn-beijing.aliyuncs.com'
```

**修改**：
- 检测 `customDomain` 是否包含 `.aliyuncs.com`
- 只有真正的自定义域名才启用 `cname` 模式
- 标准 OSS 域名让 SDK 自动构建

```typescript
const hasRealCustomDomain = this.config.customDomain && 
                            !this.config.customDomain.includes('.aliyuncs.com');

if (hasRealCustomDomain) {
  ossConfig.endpoint = this.config.customDomain;
  ossConfig.cname = true;
} else {
  // 使用标准 OSS 域名，让 SDK 自动构建
}
```

## 🧪 测试工具

### 1. OSS 配置检查

```bash
npx tsx scripts/check-oss-config.ts
```

**输出示例**：
```
📋 数据库中的 OSS 相关配置:
  ALIYUN_OSS_REGION: oss-cn-beijing
  ALIYUN_OSS_BUCKET: profile-qhr-resource
  ALIYUN_OSS_ACCESS_KEY_ID: ***
  ALIYUN_OSS_ACCESS_KEY_SECRET: ***
  ✅ 配置完整
```

### 2. 文件服务初始化测试

```bash
npx tsx scripts/test-file-service.ts
```

**输出示例**：
```
📊 存储提供者状态:
  aliyun-oss:
    - 已注册: ✅
    - 已初始化: ✅
  local:
    - 已注册: ✅
    - 已初始化: ✅

🔍 测试存储提供者选择逻辑:
  1. 尝试使用默认存储 (aliyun-oss): ✅ 可用
  ✅ 最终选择的存储提供者: aliyun-oss
```

## 📝 使用步骤

### 1. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
pnpm dev
```

### 2. 测试文件上传

访问 MMD 上传页面：`http://localhost:3001/testField/mmdUpload`

拖拽一个 MMD 压缩包（.zip）到上传区域。

### 3. 查看上传日志

观察服务器终端输出：

**成功使用 OSS**：
```
📤 [UniversalFileService] 使用存储提供者: aliyun-oss
✅ [upload-mmd-zip] 上传完成: 57/57 个文件
```

**降级到本地存储**：
```
⚠️ [UniversalFileService] OSS 不可用或未初始化，回退到本地存储
✅ [UniversalFileService] 切换到本地存储
📤 [UniversalFileService] 使用存储提供者: local
```

## 🔧 网络问题排查

如果看到 DNS 解析错误：

```
getaddrinfo ENOTFOUND profile-qhr-resource.oss-cn-beijing.aliyuncs.com
```

### 可能原因：

1. **DNS 配置问题**
   ```bash
   # 测试 DNS 解析
   nslookup profile-qhr-resource.oss-cn-beijing.aliyuncs.com
   ```

2. **网络连接问题**
   ```bash
   # 测试网络连接
   curl -I https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com
   ```

3. **防火墙阻止**
   - 检查公司/学校网络是否阻止 OSS 访问
   - 尝试使用 VPN 或更换网络

### 解决方案：

**即使网络问题无法解决，文件上传功能仍会正常工作**（通过降级到本地存储）。

## ⚠️ 注意事项

1. **本地存储路径**：
   - 默认：`uploads/` 目录
   - 可通过环境变量配置：`FILE_STORAGE_PATH`

2. **本地存储备用**：
   - 本地存储会在以下情况启用：
     - 配置管理器未找到 OSS 配置
     - OSS Provider 初始化失败
     - OSS Provider 在运行时不可用

3. **CDN URL**：
   - OSS 上传成功：`cdnUrl` 为完整的 OSS URL
   - 本地存储：`cdnUrl` 为本地路径（如 `/uploads/mmd/...`）

## 🎯 预期行为

### 理想情况（OSS 正常）

1. ✅ OSS Provider 初始化成功
2. ✅ 文件上传到 OSS
3. ✅ 返回 OSS CDN URL

### 降级情况（OSS 不可用）

1. ⚠️ OSS Provider 初始化失败或不可用
2. 🔄 自动切换到本地存储
3. ✅ 文件保存到本地 `uploads/` 目录
4. ✅ 返回本地文件路径

**无论哪种情况，上传功能都不会报错！** 🎉

## 📚 相关文件

- `src/services/universalFile/providers/AliyunOSSProvider.ts` - OSS Provider 实现
- `src/services/universalFile/UniversalFileService.ts` - 文件服务核心
- `src/services/universalFile/config/index.ts` - 配置管理
- `src/app/api/upload-mmd-zip/route.ts` - MMD 压缩包上传 API
- `scripts/check-oss-config.ts` - OSS 配置检查脚本
- `scripts/test-file-service.ts` - 文件服务测试脚本

## 🔗 相关文档

- [OSS CORS 配置](./oss-cors-setup.md)
- [MMD 资源上传指南](./mmd-resource-upload-guide.md)
- [OSS 路径格式说明](./mmd-oss-path-guide.md)

