# Holt WordPress（PHP 旁路「子应用」）文档索引

> 读者画像：熟悉 **H5 / JS / CSS**、**iOS（OC / Swift）**、**鸿蒙（ArkTS）**，暂不熟悉 PHP / WordPress。  
> 本目录是 Holt 站在 monorepo 里的 **文档入口**（物理位置：`deploy/wordpress/php/`）。  
> Holt **不是** `apps/*` 里的 Next 子应用，而是网关旁路的 **Docker + PHP WordPress**。

线上：https://qhr062.top/wp/holt/  
后台：https://qhr062.top/wp/holt/wp-admin/（用户 `holt`，密码约定见旁路 skill：`776688`）

## 建议阅读顺序

| 序号 | 文档 | 你要搞懂什么 |
|------|------|----------------|
| 1 | [01-给前端和移动端开发者的心智模型.md](./01-给前端和移动端开发者的心智模型.md) | 用 Swift / ArkTS / H5 类比理解 WP |
| 2 | [02-WordPress二开教程.md](./02-WordPress二开教程.md) | 主题、模板、CPT、改 CSS/PHP 从哪下手 |
| 3 | [03-从安装到Holt线上站.md](./03-从安装到Holt线上站.md) | 从空站到现在 Holt 站的整体流程 |
| 4 | [04-当前网关部署流程.md](./04-当前网关部署流程.md) | 推 `main` → CI → 服务器 `/wp/holt/` |
| 5 | [05-独立域名Docker整包部署.md](./05-独立域名Docker整包部署.md) | 后期整包迁到新域名（如 `holt.example.com`） |
| 6 | [06-学习资料.md](./06-学习资料.md) | 官方手册 + 精选教程与练习路径 |

## 代码在哪

```
app_wordpress/holt/                   ← Holt 主题 submodule（前台二开主战场）
deploy/wordpress/
├── php/                          ← 你正在读的文档
├── docker-compose.dev.yml        ← 本地独立起站
├── nginx-dev.conf
├── README.md / ADD-SITE.md / DEVELOPMENT.md
```

网关生产 compose：`deploy/docker-compose.gateway.yml`（服务 `wordpress_holt` + `wp_mariadb`）。

## 一句话架构

```
浏览器 → 外层 HTTPS nginx → 网关 nginx → wordpress_holt 容器(Apache+PHP)
                                      ↘ wp_mariadb（独立库 wp_holt）
主题 submodule 挂到：
  ./app_wordpress/holt → /var/www/html/wp-content/themes/holt-portfolio/
公网路径必须带前缀：/wp/holt/
```
