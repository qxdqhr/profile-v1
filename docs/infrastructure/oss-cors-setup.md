# OSS CORS 配置指南

## 🎯 问题说明

当 MMD 组件尝试从 OSS 加载资源时，浏览器会报错：

```
Access to fetch at 'https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/...' 
from origin 'http://localhost:3001' has been blocked by CORS policy
```

这是因为 OSS Bucket 没有配置允许跨域访问。

## 🔧 解决方案

### 方案一：通过阿里云控制台配置（推荐，最简单）

#### 1. 登录阿里云 OSS 控制台

访问：https://oss.console.aliyun.com/

#### 2. 选择你的 Bucket

找到并点击 `profile-qhr-resource`

#### 3. 配置 CORS 规则

1. 点击左侧菜单「权限管理」→「跨域设置」
2. 点击「创建规则」按钮
3. 填写以下配置：

```
来源（AllowedOrigin）：
  开发环境：
    http://localhost:3001
    http://localhost:3000
  
  生产环境：
    https://yourdomain.com
  
  或者简单粗暴（不推荐生产环境）：
    *

允许 Methods：
  ✅ GET
  ✅ POST
  ✅ PUT
  ✅ DELETE
  ✅ HEAD

允许 Headers：
  *

暴露 Headers：
  ETag
  x-oss-request-id

缓存时间（秒）：
  600
```

#### 4. 保存并测试

点击「确定」保存规则，然后刷新你的 MMD 页面测试。

### 方案二：通过脚本自动配置

如果你想通过代码自动配置 CORS：

#### 1. 确保 .env.local 配置正确

```bash
ALIYUN_OSS_REGION=oss-cn-beijing
ALIYUN_OSS_BUCKET=profile-qhr-resource
ALIYUN_OSS_ACCESS_KEY_ID=your_access_key_id
ALIYUN_OSS_ACCESS_KEY_SECRET=your_access_key_secret
```

#### 2. 运行配置脚本

```bash
pnpm tsx scripts/setup-oss-cors.ts
```

脚本会自动：
- 读取你的 OSS 配置
- 设置 CORS 规则
- 验证配置是否成功

## 📋 推荐的 CORS 规则

### 开发环境（宽松）

```json
{
  "allowedOrigin": ["*"],
  "allowedMethod": ["GET", "POST", "PUT", "DELETE", "HEAD"],
  "allowedHeader": ["*"],
  "exposeHeader": ["ETag", "x-oss-request-id"],
  "maxAgeSeconds": 600
}
```

### 生产环境（严格）

```json
{
  "allowedOrigin": [
    "http://localhost:3001",
    "https://yourdomain.com"
  ],
  "allowedMethod": ["GET", "HEAD"],
  "allowedHeader": ["Range", "Content-Type"],
  "exposeHeader": ["ETag", "Content-Length"],
  "maxAgeSeconds": 3600
}
```

## ✅ 验证配置

配置完成后，你可以：

1. **在浏览器控制台检查**
   - 打开开发者工具
   - 查看 Network 标签
   - 找到 OSS 请求
   - 查看 Response Headers 中是否有 `Access-Control-Allow-Origin`

2. **使用 curl 测试**
   ```bash
   curl -I -H "Origin: http://localhost:3001" \
     https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com/test.pmx
   ```
   
   应该看到响应头中包含：
   ```
   Access-Control-Allow-Origin: *
   ```

## 🔍 常见问题

### Q: 配置后仍然报错？

A: 可能的原因：
1. CORS 规则需要几秒钟生效，等待 1-2 分钟后重试
2. 浏览器缓存了旧的响应，清除缓存或使用无痕模式
3. 检查 Bucket 权限是否为「公共读」

### Q: 生产环境如何配置？

A: 建议：
1. 只允许特定域名（你的网站域名）
2. 只允许 GET 和 HEAD 方法
3. 增加缓存时间到 3600 秒

### Q: 为什么需要配置 CORS？

A: 浏览器的同源策略限制：
- 你的网站：`http://localhost:3001`
- OSS 资源：`https://profile-qhr-resource.oss-cn-beijing.aliyuncs.com`
- 这是不同的源，需要 OSS 明确允许跨域访问

## 💡 最佳实践

1. **开发环境**：使用 `*` 允许所有来源，方便开发
2. **生产环境**：只允许你的域名，提高安全性
3. **CDN 加速**：配置自定义域名，避免直接暴露 OSS 地址
4. **定期检查**：确保 CORS 规则没有被意外修改

## 📞 需要帮助？

如果配置后仍有问题：
1. 检查浏览器控制台的完整错误信息
2. 确认 OSS Bucket 权限设置
3. 验证 AccessKey 是否有足够的权限
4. 查看阿里云 OSS 文档：https://help.aliyun.com/document_detail/31870.html

