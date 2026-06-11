# 生产环境部署指南

> 启动级与业务配置（数据库、Auth、OSS、首页、华容道等）统一使用 **YAML + SOPS**，详见 [`config/README.md`](../config/README.md)。

## 1. 准备生产配置

```bash
cp config/app.config.example.yaml config/app.config.production.plain.yaml
# 编辑 database / auth / storage / business
pnpm config:encrypt-production
git add config/production.enc.yaml config/.sops.yaml
```

## 2. 服务器解密

```bash
# 复制 age 私钥到服务器（勿进 Git）
scp config/keys/age-key.txt server:/root/.config/sops/age/keys.txt

# 解密为运行时明文
./scripts/config-decrypt-production.sh /root/profile-v1/app.config.yaml
```

## 3. Docker 部署

CI 构建镜像后，在服务器运行（见 `.github/workflows/docker-build-push.yml`）：

```bash
docker run -d \
  -p 3000:3000 \
  -e APP_CONFIG_ENV=production \
  -v /root/profile-v1/app.config.yaml:/app/config/app.config.production.yaml:ro \
  ...
```

## 4. 检查

```bash
pnpm config:doctor
```

## 已废弃

- ~~`.env.production`~~ → `config/app.config.*.yaml`
- ~~GitHub Secrets 存 DATABASE_URL/OSS Key~~ → SOPS 密文进仓 + 服务器解密
- ~~configManager 数据库表~~ → `business:` 节 + 管理页/API 已移除
