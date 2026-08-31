# 05 · 后期：Docker 整包部署到新域名

当你希望 Holt **不再挂在** `qhr062.top/wp/holt/`，而是例如：

- `https://holt.example.com/` 或  
- `https://music.friend.com/`

可以采用 **独立 compose 整包**（WP + MariaDB + 可选 nginx），与 profile 网关解耦。

> 这是**规划 / 操作手册**；仓库里现成的是「网关旁路」方案。整包可从 `docker-compose.dev.yml` 演进而来。

## 1. 两种拓扑对比

| | 现在（旁路） | 整包新域名 |
|--|--------------|------------|
| URL | `https://主域/wp/holt/` | `https://holt.新域/` |
| nginx | 网关两条 location + REQUEST_URI 补丁 | 可极简：整站反代到 wordpress:80 |
| WP_HOME | 必须含 `/wp/holt` | 通常是 `https://holt.新域`（无子路径） |
| 运维 | 跟 profile-v1 一起发 | 可单独仓库 / 单独服务器 |
| 证书 | 跟主域 | 新域单独签（Let’s Encrypt 等） |

**子路径最烦的是 nginx strip 规则；独立域名几乎可删掉这套复杂度。**

## 2. 推荐整包 compose 形态

```yaml
# 示意：独立栈（新域名）
services:
  db:
    image: mariadb:11
    volumes: [ db_data:/var/lib/mysql ]
    environment:
      MARIADB_DATABASE: wp_holt
      MARIADB_USER: wp
      MARIADB_PASSWORD: ${WP_DB_PASSWORD}
      MARIADB_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD}

  wordpress:
    image: wordpress:6-apache
    depends_on: [db]
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_PASSWORD: ${WP_DB_PASSWORD}
      WORDPRESS_DB_NAME: wp_holt
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_HOME', 'https://holt.example.com');
        define('WP_SITEURL', 'https://holt.example.com');
        if (isset($$_SERVER['HTTP_X_FORWARDED_PROTO']) && $$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
          $$_SERVER['HTTPS'] = 'on';
        }
    volumes:
      - uploads:/var/www/html/wp-content/uploads
      - ./themes/holt-portfolio:/var/www/html/wp-content/themes/holt-portfolio:ro

  nginx:
    image: nginx:alpine
    ports: [ "80:80", "443:443" ]
    volumes:
      - ./nginx-standalone.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on: [wordpress]
```

独立域名下 nginx 可简化为：

```nginx
server {
  listen 443 ssl;
  server_name holt.example.com;
  # ssl_certificate ...;

  location / {
    proxy_pass http://wordpress:80;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

**一般不再需要**「去前缀 / 保留 URI」双 location。

## 3. 从现网迁数据到新域名

1. **备份**  
   - 数据库：`mysqldump` / `mariadb-dump` 导出 `wp_holt`  
   - 媒体：打包 `uploads` volume  
2. **新机 compose up**，先用临时 URL 或直接新域  
3. **导入** SQL + 解压 uploads  
4. **替换站点 URL**（三选一或组合）  
   - WP-CLI：`wp search-replace 'https://qhr062.top/wp/holt' 'https://holt.example.com' --all-tables`  
   - 或后台「设置 → 常规」改 WordPress 地址 / 站点地址  
   - 并更新 `WP_HOME` / `WP_SITEURL` 环境变量后重建容器  
5. **激活主题**、检查固定链接、清缓存  
6. DNS 指向新机，HTTPS 证书就绪  
7. （可选）旧 `/wp/holt/` 301 到新域  

## 4. 主题与 CI 怎么搬

最小搬迁：

```
themes/holt-portfolio/   # 原样复制
data/                    # 可选，便于再导入
docker-compose.yml       # 新整包
nginx-standalone.conf
.env.example
```

发布可选：

- 仍用 GitHub Actions：只 scp 主题 + `compose pull/up`  
- 或把主题打进自定义镜像 `FROM wordpress:6-apache` + `COPY themes/...`（适合「客户机只有 Docker」交付）

## 5. 检查清单（上线新域）

- [ ] `WP_HOME` / `WP_SITEURL` = 新域（https、无错误尾斜杠策略一致）  
- [ ] 后台能登录；登录后仍在新域 `/wp-admin/`  
- [ ] 前台 CSS / 封面 / 嵌入播放器正常  
- [ ] REST `/wp-json/wp/v2/work` 200  
- [ ] 邮件 / 表单若有，检查外链与回调域  
- [ ] 备份策略（DB + uploads）独立于 profile 主站  

## 6. 何时不必整包

- 继续跟主站同域、统一运维 → **保持现旁路**即可  
- 只是想「少改 nginx」→ 优先评估 **子域名** 挂在现网关（仍可共用 MariaDB），比迁服务器更轻  

返回索引：[README.md](./README.md)
