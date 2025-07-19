# 生产环境部署指南

## 环境变量配置

### 1. 复制环境变量模板
```bash
cp env.template .env.production
```

### 2. 配置OSS连接信息
编辑 `.env.production` 文件，填入您的实际配置：

```bash
# 阿里云OSS配置
ALIYUN_OSS_REGION="oss-cn-beijing"
ALIYUN_OSS_BUCKET="profile-qhr-resource"
ALIYUN_OSS_ACCESS_KEY_ID="您的AccessKey ID"
ALIYUN_OSS_ACCESS_KEY_SECRET="您的AccessKey Secret"
ALIYUN_OSS_CUSTOM_DOMAIN="oss-cn-beijing.aliyuncs.com"
ALIYUN_OSS_SECURE="true"
ALIYUN_OSS_INTERNAL="false"
```

### 3. 配置数据库连接
```bash
DATABASE_URL="postgresql://用户名:密码@数据库地址:5432/数据库名"
```

## 部署步骤

### 1. 安装依赖
```bash
pnpm install
```

### 2. 构建项目
```bash
pnpm build
```

### 3. 运行数据库迁移
```bash
# 推送数据库架构变更
pnpm prodb:push

# 生成迁移文件（如果需要）
pnpm prodb:generate
```

### 4. 启动生产服务
```bash
pnpm start
```

## 部署平台特定配置

### Vercel 部署
1. 在 Vercel 项目设置中添加环境变量
2. 确保所有 OSS 相关环境变量都已配置
3. 部署时会自动使用这些环境变量

### Docker 部署
```dockerfile
# 在 Dockerfile 中设置环境变量
ENV NODE_ENV=production
ENV ALIYUN_OSS_REGION=oss-cn-beijing
ENV ALIYUN_OSS_BUCKET=profile-qhr-resource
# ... 其他环境变量
```

### 服务器部署
1. 在服务器上创建 `.env.production` 文件
2. 填入正确的环境变量值
3. 使用 PM2 或其他进程管理器启动应用

## 安全注意事项

1. **永远不要提交包含真实密钥的环境变量文件**
2. **使用强密码和定期轮换的AccessKey**
3. **限制OSS AccessKey的权限范围**
4. **在生产环境中使用HTTPS**
5. **定期备份数据库**

## 故障排除

### OSS连接失败
1. 检查AccessKey是否正确
2. 确认Bucket名称和Region
3. 验证网络连接

### 数据库连接失败
1. 检查DATABASE_URL格式
2. 确认数据库服务是否运行
3. 验证防火墙设置

### 图片加载失败
1. 检查OSS文件是否存在
2. 确认存储提供者配置
3. 验证CORS设置 