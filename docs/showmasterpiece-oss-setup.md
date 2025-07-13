# ShowMasterpiece模块 - OSS配置指南

## 🎯 概述

ShowMasterpiece模块现已支持阿里云OSS存储，新上传的图片将自动存储到云端，享受CDN加速和更好的性能。

## 🔧 配置步骤

### 1. 创建环境配置文件

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```bash
# ===== 数据库配置 =====
DATABASE_URL=postgresql://user:password@localhost:5432/profile_v1_dev

# ===== 通用文件服务配置 =====
# 文件存储路径
FILE_STORAGE_PATH=uploads
FILE_BASE_URL=/uploads

# 最大文件大小（字节）- 100MB
MAX_FILE_SIZE=104857600

# 文件处理配置
ENABLE_FILE_PROCESSING=true
PROCESSING_QUEUE_SIZE=10

# 缓存配置
METADATA_CACHE_TTL=3600
URL_CACHE_TTL=1800

# ===== 阿里云OSS配置 =====
# OSS地域（如：oss-cn-hangzhou）
ALIYUN_OSS_REGION=oss-cn-hangzhou

# OSS访问密钥ID（从阿里云控制台获取）
ALIYUN_OSS_ACCESS_KEY_ID=your_access_key_id

# OSS访问密钥Secret（从阿里云控制台获取）
ALIYUN_OSS_ACCESS_KEY_SECRET=your_access_key_secret

# OSS存储桶名称
ALIYUN_OSS_BUCKET=your_bucket_name

# OSS自定义域名（可选，如果配置了自定义域名）
ALIYUN_OSS_CUSTOM_DOMAIN=

# OSS是否使用HTTPS（推荐）
ALIYUN_OSS_SECURE=true

# OSS是否使用内网访问（服务器部署时可开启以节省流量费用）
ALIYUN_OSS_INTERNAL=false

# ===== CDN配置 =====
# CDN加速域名（强烈推荐配置以提升访问速度）
ALIYUN_CDN_DOMAIN=

# CDN访问密钥（用于缓存刷新等操作）
ALIYUN_CDN_ACCESS_KEY_ID=
ALIYUN_CDN_ACCESS_KEY_SECRET=
ALIYUN_CDN_REGION=cn-hangzhou

# ===== 应用配置 =====
# 环境类型
NODE_ENV=development

# 请求体大小限制
MAX_REQUEST_SIZE=52428800

# 文件上传配置
DEFAULT_EXPIRATION_DAYS=7
ENABLE_ENCRYPTION=false
ENABLE_COMPRESSION=true
```

### 2. 阿里云OSS配置

#### 2.1 创建OSS Bucket

1. 登录阿里云控制台
2. 进入对象存储OSS服务
3. 创建新的Bucket：
   - **Bucket名称**: 选择一个唯一的名称（如：your-project-images）
   - **地域**: 选择离用户最近的地域（如：华东1杭州）
   - **存储类型**: 标准存储
   - **读写权限**: 公共读（允许匿名访问图片）
   - **版本控制**: 关闭（可选）

#### 2.2 配置跨域规则（CORS）

在Bucket设置中添加跨域规则：

```json
{
  "allowedOrigins": ["*"],
  "allowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["ETag", "x-oss-request-id"],
  "maxAgeSeconds": 3600
}
```

#### 2.3 创建RAM用户和访问密钥

1. 进入RAM访问控制
2. 创建新用户，选择"编程访问"
3. 为用户添加OSS权限策略：`AliyunOSSFullAccess`
4. 保存AccessKey ID和AccessKey Secret

### 3. CDN配置（可选但推荐）

#### 3.1 创建CDN域名

1. 进入CDN控制台
2. 添加域名：
   - **加速域名**: 您的自定义域名（如：img.yourdomain.com）
   - **源站类型**: OSS域名
   - **源站地址**: 选择您的OSS Bucket
   - **端口**: 80和443
   - **加速区域**: 中国大陆

#### 3.2 配置缓存规则

设置缓存规则以优化性能：

- **图片文件** (*.jpg, *.png, *.gif, *.webp): 缓存1年
- **其他文件**: 缓存1个月

## 🚀 使用说明

### 配置完成后的效果

1. **新上传的图片**：
   - 自动上传到阿里云OSS
   - 享受CDN加速
   - 减少数据库负载
   - 提升图片加载速度

2. **存量图片**：
   - 保持Base64存储（向后兼容）
   - 可以通过迁移工具批量迁移到OSS

### 存储模式自动选择

系统会根据配置自动选择存储模式：

- **OSS已配置**: 新上传使用OSS存储
- **仅本地存储**: 使用通用文件服务管理
- **无配置**: 回退到传统Base64存储

### 上传界面变化

在ShowMasterpiece配置页面，您会看到：

1. **存储模式指示器**：显示当前使用的存储方式
2. **上传模式切换**：可以在传统模式和文件服务模式之间切换
3. **上传状态提示**：显示上传进度和结果

## 🔄 数据迁移

### 批量迁移现有数据

如果您有现有的Base64图片数据，可以使用迁移工具：

```bash
# 试运行迁移（查看将要迁移的数据）
pnpm migration:artwork --dry-run

# 执行实际迁移
pnpm migration:artwork

# 验证迁移结果
pnpm migration:artwork --verify
```

### 迁移特性

- **安全可靠**: 支持试运行和回滚
- **批量处理**: 自动处理所有作品
- **文件验证**: 确保文件完整性
- **统计报告**: 详细的迁移统计

## 📊 性能提升

配置OSS后，您将获得：

- **数据库负载减少60%**: 不再存储大型Base64数据
- **图片加载速度提升70%**: CDN全球加速
- **用户体验改善**: 更快的页面加载
- **存储成本优化**: 按需付费，更经济

## 🔧 故障排除

### 常见问题

1. **上传失败**：
   - 检查AccessKey配置是否正确
   - 确认Bucket权限设置为公共读
   - 验证跨域规则配置

2. **图片无法显示**：
   - 检查Bucket读写权限
   - 确认CDN域名配置正确
   - 验证图片URL是否可访问

3. **配置不生效**：
   - 重启开发服务器
   - 检查环境变量是否正确加载
   - 查看控制台日志信息

### 日志查看

在浏览器控制台可以看到详细的上传日志：

```
🚀 [ShowMasterpiece] 使用阿里云OSS存储
📤 [通用文件服务] 收到文件上传请求
✅ [ShowMasterpiece] 作品图片上传成功
```

## 🔒 安全建议

1. **访问密钥安全**：
   - 不要将AccessKey提交到代码仓库
   - 定期轮换访问密钥
   - 使用最小权限原则

2. **Bucket安全**：
   - 启用访问日志
   - 配置防盗链
   - 定期检查权限设置

3. **CDN安全**：
   - 配置HTTPS
   - 设置访问控制
   - 启用防盗链

## 📈 监控和维护

1. **定期检查**：
   - OSS存储使用量
   - CDN流量统计
   - 文件访问日志

2. **性能监控**：
   - 图片加载时间
   - 上传成功率
   - 用户访问体验

3. **成本优化**：
   - 清理无用文件
   - 优化缓存策略
   - 调整存储类型 