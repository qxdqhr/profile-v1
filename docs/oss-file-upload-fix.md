# OSS 文件上传问题修复说明

## 📋 问题描述

在使用 MMD 压缩包上传功能时，遇到错误：

```
StorageProviderError: OSS存储提供者未初始化
at AliyunOSSProvider.ensureInitialized
```

## 🔍 问题诊断

运行诊断脚本检查配置和连接状态：

```bash
# 检查 OSS 配置
npx tsx scripts/check-oss-config.ts

# 测试文件服务初始化
npx tsx scripts/test-file-service.ts
```

**可能的失败原因**：

1. **DNS 解析失败**：`getaddrinfo ENOTFOUND profile-qhr-resource.oss-cn-beijing.aliyuncs.com`
   - 网络连接问题
   - DNS 配置问题
   - 防火墙阻止

2. **配置错误**：
   - `ALIYUN_OSS_REGION` 格式不正确
   - `ALIYUN_OSS_BUCKET` 不存在
   - Access Key 无效

3. **权限问题**：
   - Access Key 没有 Bucket 访问权限
   - Bucket 策略限制

## ✅ 解决方案

### 1. OSS Provider 连接测试

**修改文件**：`src/services/universalFile/providers/AliyunOSSProvider.ts`

**修改内容**：
- 保持 `testConnection()` 的严格检查
- 连接测试失败时抛出错误，`isInitialized` 保持为 `false`
- 确保只有成功连接的 Provider 才能被使用

```typescript
// 测试连接
await this.testConnection();

this.isInitialized = true;
console.log(`✅ [AliyunOSSProvider] 阿里云OSS初始化完成`);
```

**错误处理**：
```typescript
catch (error) {
  console.error('❌ [AliyunOSSProvider] 阿里云OSS初始化失败:', error);
  this.isInitialized = false;
  throw new StorageProviderError(
    `阿里云OSS初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
  );
}
```

### 2. 严格的存储提供者检查

**修改文件**：`src/services/universalFile/UniversalFileService.ts`

**修改内容**：
- 在上传前严格检查存储提供者是否存在
- 检查存储提供者是否已成功初始化
- **不降级**：如果 OSS 不可用，直接抛出清晰的错误信息

```typescript
// 检查 Provider 是否存在
if (!storageProvider) {
  throw new StorageProviderError(`存储提供者不存在: ${selectedStorageType}`);
}

// 检查 Provider 是否已初始化
const isInitialized = !('isInitialized' in storageProvider) || storageProvider['isInitialized'] === true;
if (!isInitialized) {
  throw new StorageProviderError(
    `存储提供者未初始化: ${selectedStorageType}。` +
    `请检查配置或网络连接，确保 ${selectedStorageType} 正常工作。`
  );
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

### 1. 确保 OSS 配置正确

运行检查脚本：
```bash
npx tsx scripts/check-oss-config.ts
```

确认所有必需配置都已设置：
- ✅ `ALIYUN_OSS_REGION`
- ✅ `ALIYUN_OSS_BUCKET`
- ✅ `ALIYUN_OSS_ACCESS_KEY_ID`
- ✅ `ALIYUN_OSS_ACCESS_KEY_SECRET`

### 2. 测试文件服务

```bash
npx tsx scripts/test-file-service.ts
```

确认输出显示：
```
aliyun-oss:
  - 已注册: ✅
  - 已初始化: ✅  ← 必须是 ✅
```

### 3. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
pnpm dev
```

### 4. 测试文件上传

访问 MMD 上传页面：`http://localhost:3001/testField/mmdUpload`

拖拽一个 MMD 压缩包（.zip）到上传区域。

### 5. 查看上传日志

观察服务器终端输出：

**成功**：
```
📤 [UniversalFileService] 使用存储提供者: aliyun-oss
✅ 上传完成: 57/57 个文件
```

**失败**：
```
❌ 上传失败: StorageProviderError: 存储提供者未初始化: aliyun-oss
提示：请检查配置或网络连接，确保 aliyun-oss 正常工作。
```

## 🔧 网络问题排查

如果看到 DNS 解析错误：

```
getaddrinfo ENOTFOUND profile-qhr-resource.oss-cn-beijing.aliyuncs.com
```

### 诊断步骤：

1. **测试 DNS 解析**
   ```bash
   nslookup profile-qhr-resource.oss-cn-beijing.aliyuncs.com
   ```
   
   预期输出应包含 IP 地址。如果失败，说明 DNS 无法解析。

2. **测试网络连接**
   ```bash
   curl -I https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com
   ```
   
   应返回 HTTP 响应头。如果超时或连接被拒绝，说明网络不通。

3. **检查防火墙**
   - 公司/学校网络可能阻止 OSS 访问
   - 尝试使用手机热点或其他网络
   - 联系网络管理员开放 `*.aliyuncs.com` 的访问

### 解决方案：

1. **修复网络连接**（推荐）
   - 确保能访问阿里云 OSS
   - 配置正确的 DNS 服务器
   - 关闭可能阻止连接的代理/VPN

2. **使用本地存储**（临时方案）
   - 修改数据库中的配置：`defaultStorage: 'local'`
   - 启用本地存储提供者
   - 文件将保存到 `uploads/` 目录

**注意**：新的实现**不会自动降级**，必须解决 OSS 连接问题或手动切换到本地存储。

## ⚠️ 注意事项

1. **严格模式**：
   - OSS 不可用时**不会自动降级**到本地存储
   - 必须确保 OSS 配置正确且网络连接正常
   - 上传失败会抛出清晰的错误信息

2. **错误排查优先级**：
   - 首先运行 `check-oss-config.ts` 检查配置
   - 然后运行 `test-file-service.ts` 测试初始化
   - 最后检查网络连接（DNS、防火墙等）

3. **切换到本地存储**（如果需要）：
   - 修改数据库中的 `defaultStorage` 配置
   - 或在代码中明确指定使用 `local` 存储
   ```typescript
   await fileService.uploadFile(fileInfo, 'local')  // 强制使用本地存储
   ```

4. **CDN URL**：
   - OSS 成功：`cdnUrl` 为 OSS URL（如 `https://bucket.region.aliyuncs.com/path`）
   - 本地存储：`cdnUrl` 为本地路径（如 `/uploads/mmd/...`）

## 🎯 预期行为

### 成功情况（OSS 正常）

1. ✅ OSS 配置正确
2. ✅ 网络连接正常
3. ✅ OSS Provider 初始化成功（`isInitialized: true`）
4. ✅ 文件上传到 OSS
5. ✅ 返回 OSS CDN URL

### 失败情况（OSS 不可用）

1. ❌ OSS 配置错误 或 网络连接失败
2. ❌ OSS Provider 初始化失败（`isInitialized: false`）
3. ❌ 文件上传时抛出错误：
   ```
   StorageProviderError: 存储提供者未初始化: aliyun-oss
   请检查配置或网络连接，确保 aliyun-oss 正常工作。
   ```
4. ⚠️ **不会自动降级到本地存储**
5. ⚠️ 用户需要手动修复 OSS 问题或切换到本地存储

**关键差异**：
- **之前**：OSS 不可用时自动降级到本地存储
- **现在**：OSS 不可用时直接报错，要求修复问题

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

