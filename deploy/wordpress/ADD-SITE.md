# 新增 WordPress 主题站（多实例）

每站 = 独立容器 + 独立 MariaDB database + 独立 uploads volume + 一条 nginx `location`。  
**不要**使用 WordPress Multisite；**不要**把整个 `/wp/` 反代到单一 upstream。

假设新站 slug = `theme-a`（URL：`/wp/theme-a/`）。

## 1. MariaDB 建库

在已运行的 `wp_mariadb` 上：

```bash
docker compose -f docker-compose.gateway.yml exec -T wp_mariadb \
  mariadb -uroot -p"$MARIADB_ROOT_PASSWORD" \
  -e "CREATE DATABASE IF NOT EXISTS wp_theme_a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      GRANT ALL ON wp_theme_a.* TO 'wp'@'%';
      FLUSH PRIVILEGES;"
```

（生产也可用专用 DB 用户；首期可复用 `WORDPRESS_DB_USER`。）

## 2. 复制 compose service

在 [`../docker-compose.gateway.yml`](../docker-compose.gateway.yml) 增加 `wordpress_theme_a`（镜像与 `wordpress_holt` 相同），例如：

- `WORDPRESS_DB_NAME=wp_theme_a`
- `WP_THEME_A_PUBLIC_URL` → `WORDPRESS_CONFIG_EXTRA` 中的 `WP_HOME` / `WP_SITEURL`
- volume：`wp_theme_a_uploads:/var/www/html/wp-content/uploads`
- `nginx.depends_on` 追加该服务

## 3. nginx

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

## 4. 环境变量

服务器 `.env` 追加：

```bash
WP_THEME_A_PUBLIC_URL=https://qhr062.top/wp/theme-a
```

并确保 `deploy-profile-v1.sh` 会保留该键（当前已保留 `MARIADB_*` / `WORDPRESS_DB_*` / `WP_HOLT_PUBLIC_URL`；新站的 `WP_<SLUG>_PUBLIC_URL` 需在脚本白名单中追加一行）。

## 5. 启动与验收

```bash
docker compose -f docker-compose.gateway.yml up -d wordpress_theme_a
docker compose -f docker-compose.gateway.yml exec -T nginx nginx -t
docker compose -f docker-compose.gateway.yml exec -T nginx nginx -s reload
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/wp/theme-a/
```

浏览器打开 `/wp/theme-a/` 完成安装，安装目标主题。

## 6. 文档

更新 `MIGRATION-RUNBOOK.md` 路由表与本目录站点清单。

### 已登记站点

| slug | 路径 | DB | compose service |
|------|------|-----|-----------------|
| holt | `/wp/holt/` | `wp_holt` | `wordpress_holt` | `holt-portfolio` |
