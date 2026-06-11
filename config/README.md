# profile-v1 统一配置（YAML + SOPS）

应用**启动级与业务级**配置均从 YAML 读取，由 `sa2kit/common/config/bootstrap` 加载。  
`configManager` 数据库表已废弃并移除；首页、华容道等业务配置写入 `business:` 节。

## 文件

| 路径 | Git | 说明 |
|------|-----|------|
| `app.config.example.yaml` | ✅ | 模板 |
| `app.config.local.yaml` | ❌ | 本地开发（从 example 复制） |
| `production.enc.yaml` | ✅ 密文 | SOPS 加密的生产配置 |
| `app.config.production.yaml` | ❌ | 运行时明文（解密产物） |
| `.sops.yaml` | ✅ | SOPS 规则 + age **公钥** |
| `keys/age-key.txt` | ❌ | age **私钥**（仅本机与生产服务器） |

## 本地开发

```bash
cp config/app.config.example.yaml config/app.config.local.yaml
# 编辑 database / auth / storage / business
pnpm config:doctor
pnpm config:verify-business   # 验证首页/华容道 YAML 读写与 configManager 表已删除
pnpm dev
```

### `business` 节

| 键 | 说明 |
|----|------|
| `business.homePage` | 个人主页 Hero、导航、时间线等（缺省用代码默认值） |
| `business.huarongdao` | 华容道主题、关卡、BGM 列表 |
| `business.qiniu` | 七牛云（可选，未启用 OSS 时备用） |

管理页保存（首页配置、华容道配置）会**写回**当前环境的 YAML 文件。

## SOPS 初始化（首次）

```bash
./scripts/config-sops-init.sh
pnpm config:encrypt-production   # 若 openSUSE 无 sops，会自动用 age 加密
```

编辑生产明文（**勿提交 Git**）：

```bash
nano config/app.config.production.plain.yaml
pnpm config:encrypt-production
```

> **不要用** `$EDITOR config/...yaml`：若 `$EDITOR` 未设置，zsh 会把 yaml 当命令执行，报「权限不够」。

安装 sops（可选，便于 `sops -d` 编辑密文）：

```bash
pnpm config:install-sops
export PATH="$HOME/.local/bin:$PATH"
```

## 生产部署

在服务器解密为运行时明文（Docker 挂载）：

```bash
./scripts/config-decrypt-production.sh
# 输出: config/app.config.production.yaml

docker run ... \
  -v /root/profile-v1/app.config.yaml:/app/config/app.config.production.yaml:ro \
  -e APP_CONFIG_ENV=production \
  ...
```

CI **不需要** GitHub Secrets 存 DATABASE_URL / OSS Key；仅需部署 SSH（现有 workflow）。

## 环境变量（可选）

- `APP_CONFIG_PATH` — 显式 YAML 路径
- `APP_CONFIG_ENV` — `local` | `production` | `test`
- `SOPS_AGE_KEY_FILE` — age 私钥路径（解密/编辑 SOPS 时）
