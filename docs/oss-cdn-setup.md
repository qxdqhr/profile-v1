 # 阿里云OSS和CDN配置指南

本文档介绍如何为画集管理系统配置阿里云OSS和CDN，以提升图片上传速度和加载性能。

## 🚀 性能优化效果

- **上传速度提升**: 直接上传到OSS，避免经过服务器转发
- **加载速度提升**: 通过CDN全球加速节点就近访问
- **存储成本降低**: OSS按需计费，比本地存储更经济
- **可靠性提升**: 99.999999999%的数据可靠性

## 📋 前置准备

### 1. 阿里云账号和资源
- 注册阿里云账号
- 开通OSS服务
- 开通CDN服务（可选，但强烈推荐）
- 创建RAM用户获取访问密钥

### 2. OSS配置
1. 创建OSS Bucket
   - 选择合适的地域（建议选择离用户最近的地域）
   - 设置存储类型为"标准存储"
   - 设置读写权限为"公共读"
   - 开启"传输加速"功能

2. 配置跨域规则（CORS）
   ```json
   {
     "allowedOrigins": ["*"],
     "allowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
     "allowedHeaders": ["*"],
     "exposedHeaders": ["ETag", "x-oss-request-id"],
     "maxAgeSeconds": 3600
   }
   ```

### 3. CDN配置（可选但推荐）
1. 在CDN控制台添加加速域名
2. 配置源站为OSS Bucket域名
3. 开启HTTPS
4. 配置缓存规则：
   - 图片文件：缓存1年（365天）
   - 其他文件：缓存1个月（30天）

## ⚙️ 环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# ===== 阿里云OSS配置 =====
# OSS地域（如：oss-cn-hangzhou）
ALIYUN_OSS_REGION=oss-cn-hangzhou

# OSS访问密钥ID
ALIYUN_OSS_ACCESS_KEY_ID=your_access_key_id

# OSS访问密钥Secret
ALIYUN_OSS_ACCESS_KEY_SECRET=your_access_key_secret

# OSS存储桶名称
ALIYUN_OSS_BUCKET=your_bucket_name

# OSS自定义域名（可选）
ALIYUN_OSS_ENDPOINT=your_custom_domain.com

# ===== CDN配置 =====
# CDN加速域名（强烈推荐配置）
ALIYUN_CDN_DOMAIN=https://your-cdn-domain.com

# ===== 上传配置 =====
# 最大文件大小（字节，默认20MB）
MAX_UPLOAD_SIZE=20971520

# 图片质量压缩阈值（默认0.8）
IMAGE_COMPRESSION_QUALITY=0.8

# 图片最大宽度（像素，默认1920）
IMAGE_MAX_WIDTH=1920
```

## 🛠️ 系统集成配置

### 1. 检查当前配置状态
访问 `/api/storage/config` 接口检查OSS配置状态：

```json
{
  "success": true,
  "data": {
    "currentStorageType": "oss",
    "ossConfigured": true,
    "cdnConfigured": true,
    "stats": {
      "totalFiles": 0,
      "totalSize": 0,
      "ossFiles": 0,
      "localFiles": 0
    }
  }
}
```

### 2. 配置验证
系统启动时会自动验证OSS配置：
- ✅ 配置完整：自动使用OSS存储
- ❌ 配置缺失：回退到本地存储

## 📊 性能监控

### 上传性能指标
- 小图片（<1MB）：预期上传时间 < 3秒
- 中等图片（1-5MB）：预期上传时间 < 10秒
- 大图片（5-20MB）：预期上传时间 < 30秒

### 加载性能指标
- CDN命中率：预期 > 95%
- 图片加载时间：预期 < 2秒
- 首屏加载时间：预期 < 5秒

## 🔧 故障排除

### 常见问题

#### 1. 上传失败
**错误信息**: "OSS文件上传失败"
**可能原因**:
- OSS访问密钥配置错误
- 网络连接问题
- 文件格式不支持
- 文件大小超限

**解决方案**:
1. 检查环境变量配置
2. 验证OSS权限设置
3. 检查文件格式和大小
4. 查看浏览器网络面板

#### 2. 图片加载慢
**可能原因**:
- CDN未配置或配置错误
- 缓存策略不当
- 图片尺寸过大

**解决方案**:
1. 配置CDN加速域名
2. 开启图片压缩功能
3. 检查缓存策略设置

#### 3. 跨域问题
**错误信息**: "CORS policy" 相关错误
**解决方案**:
1. 在OSS控制台配置跨域规则
2. 确保允许的源站包含你的域名

### 日志分析
查看浏览器控制台和服务器日志：
```bash
# 开发环境查看日志
npm run dev

# 生产环境查看日志
pm2 logs
```

## 🚀 性能优化建议

### 1. 图片优化
- 启用自动压缩功能
- 使用WebP格式（现代浏览器）
- 实施图片懒加载
- 配置合适的缓存策略

### 2. 上传优化
- 实施分片上传（大文件）
- 添加上传进度显示
- 实施断点续传功能
- 客户端预压缩

### 3. 网络优化
- 使用HTTP/2
- 开启Gzip压缩
- 配置CDN缓存策略
- 实施预加载策略

## 📈 扩展功能

### 即将支持的功能
- [ ] 分片上传支持
- [ ] 上传进度显示
- [ ] 图片格式自动转换
- [ ] 智能压缩策略
- [ ] 批量上传功能
- [ ] 图片水印添加

## 📞 技术支持

如遇到技术问题，请按以下步骤操作：

1. **查看配置状态**: 访问存储配置API
2. **检查日志**: 查看浏览器控制台和服务器日志
3. **验证权限**: 确认OSS和CDN权限配置
4. **网络诊断**: 检查网络连接和防火墙设置

## 🔄 更新日志

### v2.0.0 - OSS集成版本
- ✅ 集成阿里云OSS存储
- ✅ 支持CDN加速
- ✅ 自动图片压缩
- ✅ 智能存储切换
- ✅ 性能监控功能

### v1.0.0 - 基础版本
- ✅ 本地文件存储
- ✅ 基础图片上传
- ✅ 简单压缩功能