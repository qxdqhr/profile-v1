# 新增 WordPress 主题站（多实例）

每站 = 独立容器 + 独立 MariaDB database + 独立 uploads volume + **两条** nginx `location`（核心去前缀 + permalink 保留）。  
**不要**使用 WordPress Multisite；**不要**把整个 `/wp/` 反代到单一 upstream；**不要**为站内每个 URL 再加 location。

**默认管理员密码：`776688`**（安装向导与重置均用此约定）。

假设新站 slug = `theme-a`（URL：`/wp/theme-a/`）。

## 1. 主题 submodule

在仓根创建独立仓并接入父项目（与 `app_games/<slug>` 相同流程）：

```
app_wordpress/theme-a/     # git submodule（主题 PHP/CSS/JS + 可选 data/）
deploy/wordpress/        # 旁路基建（compose 模板、ADD-SITE、文档）
```

```bash
git submodule add https://github.com/qxdqhr/profile-v1-wordpress-theme-a.git app_wordpress/theme-a
```

主题目录挂载到容器内 `wp-content/themes/<theme-dir>`（目录名可与 slug 不同，如 holt → `holt-portfolio`）。

## 2. MariaDB 建库

在已运行的 `wp_mariadb` 上：

```bash
docker compose -f docker-compose.gateway.yml exec -T wp_mariadb \
  mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" \
  -e "CREATE DATABASE IF NOT EXISTS wp_theme_a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      GRANT ALL ON wp_theme_a.* TO 'wp'@'%';
      FLUSH PRIVILEGES;"
```

（生产也可用专用 DB 用户；首期可复用 `WORDPRESS_DB_USER`。）

## 3. 复制 compose service

在 [`../docker-compose.gateway.yml`](../docker-compose.gateway.yml) 增加 `wordpress_theme_a`（镜像与 `wordpress_holt` 相同），例如：

- `WORDPRESS_DB_NAME=wp_theme_a`
- `WP_THEME_A_PUBLIC_URL` → `WORDPRESS_CONFIG_EXTRA` 中的 `WP_HOME` / `WP_SITEURL`
- **必须**复制 holt 的 REQUEST_URI 补前缀逻辑（防止登录跳到裸 `/wp-admin` 404）
- volume：`wp_theme_a_uploads:/var/www/html/wp-content/uploads`
- 主题：`./app_wordpress/theme-a:/var/www/html/wp-content/themes/theme-a:ro`
- `nginx.depends_on` 追加该服务

## 4. nginx

在 [`../nginx/profile-platform.conf`](../nginx/profile-platform.conf) **复制 holt 的两条规则**（把 `holt` / `wordpress_holt` 换成新 slug），不要为单个文件再加 location：

```nginx
# ① 后台 / 静态 / 核心 PHP → 去掉前缀
location ~ ^/wp/theme-a/(wp-admin|wp-includes|wp-content|xmlrpc\.php|wp-[^/]+\.php)(/|$) {
    set $wp_theme_a_upstream wordpress_theme_a;
    rewrite ^/wp/theme-a(/.*)$ $1 break;
    proxy_pass http://$wp_theme_a_upstream;
    include /etc/nginx/proxy-params.conf;
}
# ② 前台固定链接 / wp-json → 保留完整 URI
location /wp/theme-a/ {
    set $wp_theme_a_upstream wordpress_theme_a;
    proxy_pass http://$wp_theme_a_upstream;
    include /etc/nginx/proxy-params.conf;
}
location = /wp/theme-a {
    return 301 /wp/theme-a/;
}
```

## 5. 环境变量

服务器 `.env` 追加：

```bash
WP_THEME_A_PUBLIC_URL=https://qhr062.top/wp/theme-a
```

并确保 `deploy-profile-v1.sh` 会保留该键（当前已保留 `MARIADB_*` / `WORDPRESS_DB_*` / `WP_HOLT_PUBLIC_URL`；新站的 `WP_<SLUG>_PUBLIC_URL` 需在脚本白名单中追加一行）。

## 6. 启动与验收

```bash
docker compose -f docker-compose.gateway.yml up -d wordpress_theme_a
docker compose -f docker-compose.gateway.yml exec -T nginx nginx -t
docker compose -f docker-compose.gateway.yml exec -T nginx nginx -s reload
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/wp/theme-a/
```

浏览器打开 `/wp/theme-a/` 完成安装，安装目标主题。

**管理员密码一律设为 `776688`。** 验收：能进 `/wp/theme-a/wp-admin/`；主题 CSS 与 `wp-admin/css/login.min.css` 均为 200；登录后不跳到 `https://host/wp-admin`（无 slug）。

更完整的踩坑说明见 Agent Skill：`profile-v1-wordpress-sidecar`（`~/.cursor/skills/profile-v1-wordpress-sidecar/SKILL.md`）。

## 7. 文档

更新 `MIGRATION-RUNBOOK.md` 路由表与本目录站点清单。

### 已登记站点

| slug | 路径 | DB | compose service | submodule | 主题目录 |
|------|------|-----|-----------------|-------------|----------|
| holt | `/wp/holt/` | `wp_holt` | `wordpress_holt` | `app_wordpress/holt` | `holt-portfolio` |
