# Next.js Docker 项目 HTTPS 配置操作记录

## 项目概述
- **项目名称**: qhr-profile (Next.js应用)
- **容器名称**: my_container
- **域名**: qhr062.top, www.qhr062.top
- **服务器IP**: 47.94.166.44
- **配置日期**: 2025年7月27日

## 初始状态
- Next.js应用运行在Docker容器中
- 使用自签名SSL证书
- 需要升级到生产级别的HTTPS配置

## 操作步骤记录

### 1. 环境检查和准备

#### 1.1 检查现有配置
```bash
# 检查Docker容器状态
docker ps -a

# 检查Docker镜像
docker images | grep qhr-profile

# 检查nginx配置目录
ls -la /root/nginx-ssl-setup/
```

#### 1.2 发现现有配置
- 发现 `/root/nginx-ssl-setup/` 目录包含完整的HTTPS配置
- 包含自签名SSL证书 (cert.pem, key.pem)
- 包含nginx配置和Docker Compose文件

### 2. 安装必要工具

#### 2.1 安装docker-compose
```bash
# 安装docker-compose
apt update
apt install -y docker-compose
```

#### 2.2 安装certbot (Let's Encrypt)
```bash
# 安装certbot和相关工具
apt update
apt install -y certbot python3-certbot-nginx
```

### 3. 启动Next.js应用

#### 3.1 创建简化的Docker Compose配置
由于网络问题无法拉取nginx镜像，创建了简化版本：

```bash
# 创建简化配置
cat > docker-compose-simple.yml << 'EOF'
version: '3.8'

services:
  nextjs-app:
    container_name: my_container
    image: crpi-pnnot5dqi45utyya.cn-beijing.personal.cr.aliyuncs.com/qhrqht/qhr-profile:171
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
      - app-network
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - PORT=3000
      - HOSTNAME=0.0.0.0

networks:
  app-network:
    driver: bridge
