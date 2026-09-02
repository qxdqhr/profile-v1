# WordPress 旁路寄宿（纯 PHP，非 pnpm / Next 子应用）

路径命名空间：`/wp/<slug>/`。首期站点：**`holt`**（Holt 音乐作品集）。

**给前端 / iOS / 鸿蒙开发者的二开与部署教程（推荐从这里读起）：**  
[`php/README.md`](./php/README.md)

详细加站步骤见 [ADD-SITE.md](./ADD-SITE.md)。网关集成见根目录 [`../MIGRATION-RUNBOOK.md`](../MIGRATION-RUNBOOK.md)。

## 架构

- **MariaDB**：独立于宿主机 Postgres；多站共享一台 MariaDB、每站独立 database。
- **wordpress_\<slug\>**：官方 `wordpress:6-apache`（镜像源与网关 nginx 同用 DaoCloud library）。
- **自定义主题**：`app_wordpress/holt/`（git submodule）挂载为 `holt-portfolio`（只读）。
- **nginx**（每站两条 location，勿逐文件加路由）：
  1. `~ ^/wp/<slug>/(wp-admin|wp-includes|wp-content|xmlrpc\.php|wp-[^/]+\.php)` → **去掉** `/wp/<slug>` 前缀（容器文档根真实文件：后台、主题 CSS、核心 PHP）
  2. `location /wp/<slug>/` → **保留**完整 URI（固定链接、`/wp-json/`，与 `WP_HOME` 一致）

公网示例：

| 用途 | URL |
|------|-----|
| Holt 前台 | `https://<host>/wp/holt/` |
| Holt 后台 | `https://<host>/wp/holt/wp-admin/` |
| B 站空间 | Customizer 默认 `https://b23.tv/8r56Ehc` |

`WP_HOME` / `WP_SITEURL` 必须等于该前缀（由 compose 环境变量 `WP_HOLT_PUBLIC_URL` 写入）。

## 本地开发（无 Next）

```bash
cd deploy/wordpress
cp .env.example .env
docker compose -f docker-compose.dev.yml --env-file .env up -d
```

打开 http://127.0.0.1:18080/wp/holt/ 完成安装向导，激活 **Holt Portfolio** 主题。

## 生产（网关栈）

服务定义在 [`../docker-compose.gateway.yml`](../docker-compose.gateway.yml)：`wp_mariadb`、`wordpress_holt`。

在服务器 `/root/profile-v1/.env` 设置（**勿提交**）：

```bash
MARIADB_ROOT_PASSWORD=...
WORDPRESS_DB_USER=wp
WORDPRESS_DB_PASSWORD=...
WORDPRESS_DB_NAME=wp_holt
WP_HOLT_PUBLIC_URL=https://qhr062.top/wp/holt
```

`deploy-profile-v1.sh` 重写 `.env` 时会**保留**上述 WordPress / MariaDB 变量。首次上线若尚无这些键，请手工追加后再 `compose up`。

### GitHub Secrets（CI 部署）

| Secret | 用途 |
|--------|------|
| `WP_MARIADB_ROOT_PASSWORD` | MariaDB root |
| `WP_DB_USER` | WP DB 用户（默认 `wp`） |
| `WP_DB_PASSWORD` | WP DB 密码 |
| `WP_HOLT_PUBLIC_URL` | 如 `https://qhr062.top/wp/holt` |

未配置时：沿用服务器已有 `.env`，或由 `ensure-wordpress-env.sh` 写入缺省占位（生产务必改密）。

## Holt 主题后台用法

1. **外观 → 自定义**：艺名、B 站空间、联系邮箱/微信、关于/联系文案。
2. **作品 → 添加**：标题、特色图片、B 站 PV 链接（必填）、可选音频 URL、年份、参与角色。
3. **固定页面**：安装后自动创建「关于」「联系」；首页使用 `front-page.php`。

## 与 Next 的边界

- 不创建 `apps/*` WordPress 包；不进 CI Next matrix。
- 鉴权独立（WP 账号）；不共享 `/api/auth/`。
- 主站如需入口，仅外链到 `/wp/holt/`。

## Submodule

主题与站点数据在仓根 [`app_wordpress/holt/`](../../app_wordpress/holt/)（独立仓 `profile-v1-wordpress-holt`）。克隆后：

```bash
git submodule update --init app_wordpress/holt
```
