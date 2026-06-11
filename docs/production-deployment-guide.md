# 生产环境部署指南

> 启动级与业务配置（数据库、Auth、OSS、首页、华容道等）统一使用 **YAML + SOPS**，详见 [`config/README.md`](../config/README.md)。

## 1. 准备生产配置

```bash
cp config/app.config.example.yaml config/app.config.production.plain.yaml
# 编辑 database / auth / storage / business
pnpm config:encrypt-production
git add config/production.enc.yaml config/.sops.yaml
```

## 2. GitHub Actions 自动解密与同步

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 内容 |
|--------|------|
| `SOPS_AGE_KEY` | `config/keys/age-key.txt` 全文（age 私钥，勿提交 Git） |

推送到 `main` 后，CI 会从 `config/production.enc.yaml` 解密配置并 `scp` 到服务器 `/root/profile-v1/app.config.yaml`，再启动容器。

## 3. 手动部署（可选）

```bash
./scripts/config-decrypt-production.sh /root/profile-v1/app.config.yaml
```

## 4. Docker 部署

CI 构建镜像后自动部署（见 `.github/workflows/docker-build-push.yml`）；手动启动示例：

```bash
docker run -d \
  -p 3000:3000 \
  -e APP_CONFIG_ENV=production \
  -v /root/profile-v1/app.config.yaml:/app/config/app.config.production.yaml:ro \
  ...
```

## 5. 检查

```bash
pnpm config:doctor
```

## 已废弃

- ~~`.env.production`~~ → `config/app.config.*.yaml`
- ~~GitHub Secrets 存 DATABASE_URL/OSS Key~~ → SOPS 密文进仓 + 服务器解密
- ~~configManager 数据库表~~ → `business:` 节 + 管理页/API 已移除
