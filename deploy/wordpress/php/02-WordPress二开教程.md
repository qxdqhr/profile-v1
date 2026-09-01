# 02 · WordPress 二开教程（对准 Holt 主题）

本文只讲 **经典主题（Classic Theme）** 二开——Holt 的 `holt-portfolio` 就是这种（PHP 模板 + CSS/JS），**不是** Full Site Editing / `theme.json` 区块主题。

## 1. 主题最小结构

WordPress 认主题：目录里至少有 `style.css`（带主题头）+ `index.php`。

Holt 实际结构：

```
wordpress/holt/                   ← Holt 主题 submodule（二开主战场）
deploy/wordpress/                 ← 旁路基建与教程
├── style.css              # 主题元信息（Theme Name 等）
├── functions.php          # 注册资源、CPT、启动逻辑（≈ AppDelegate）
├── header.php / footer.php
├── front-page.php         # 首页
├── archive-work.php       # 作品列表 /works/
├── single-work.php        # 单作品
├── page-about.php / page-contact.php
├── template-parts/work-card.php
├── assets/main.css / main.js
└── inc/                   # 拆出去的 PHP 模块
    ├── cpt-work.php       # 自定义文章类型 work
    ├── bilibili.php       # BV / 嵌入播放器
    ├── work-data.php      # 播放量、合集、筛选
    ├── customizer.php     # 外观 → 自定义
    └── ...
```

## 2. 模板层级（你的「路由表」）

WordPress **按文件名优先级**选模板，不用手写 router。

| URL 场景 | Holt 用的文件 |
|----------|----------------|
| 站点首页 | `front-page.php` |
| 作品归档 `/works/` | `archive-work.php` |
| 单条作品 | `single-work.php` |
| 关于 / 联系页 | `page-about.php` / `page-contact.php`（或页面指定模板） |
| 兜底 | `index.php` |

官方说明：[Template Hierarchy](https://developer.wordpress.org/themes/basics/template-hierarchy/)

改首页 UI → 改 `front-page.php` + `assets/main.css`。  
改卡片 → 改 `template-parts/work-card.php`。

## 3. `functions.php` 在干什么

常见职责（Holt 已做）：

- `wp_enqueue_style` / `wp_enqueue_script`：挂 CSS/JS（**不要**在模板里写死 `<link>` 到未版本化路径）  
- `register_post_type( 'work' )`：自定义「作品」内容类型  
- `register_taxonomy( 'work_role' )`：作曲 / 编曲 / …  
- `register_post_meta` / meta box：`bilibili_url`、`audio_url`、`work_year`  
- Customizer：艺名、B 站空间、联系方式  
- 启动时建关于/联系页、刷固定链接  

类比：Swift 里在 `application(_:didFinishLaunching:)` 注册通知、外观；这里用 `add_action( 'init', ... )`。

## 4. 改样式 / 交互（你最熟的部分）

1. 编辑 `assets/main.css`、`assets/main.js`  
2. 改 `functions.php` 里 `HOLT_THEME_VERSION`（例如 `1.1.0` → `1.1.1`）——浏览器缓存靠版本号刷新  
3. 提交并推送 `main`，等 CI 把主题 scp 到服务器（见 [04](./04-当前网关部署流程.md)）  
4. 硬刷新页面

本地可先：

```bash
cd deploy/wordpress
cp -n .env.example .env
docker compose -f docker-compose.dev.yml --env-file .env up -d
# http://127.0.0.1:18080/wp/holt/
```

主题目录已 volume 挂载，**改 CSS 保存即生效**（容器内只读挂载时需确认 compose 是否 `:ro`；生产是 CI 同步文件）。

## 5. 数据模型：作品 `work`

| 概念 | 说明 |
|------|------|
| 标题 / 正文 / 摘要 | 标准文章字段 |
| 特色图片 | 封面（媒体库） |
| `bilibili_url` | B 站 PV（必填向） |
| `audio_url` | 可选独立音频（**不**从 B 站自动转码） |
| `work_year` | 年份 |
| `work_role` | 分类法：作曲/编曲/混音/演唱/其他 |
| `_holt_play_count` 等 | 导入用的扩展 meta（播放量、合集、投稿账号） |

后台：**作品 → 添加/编辑**。  
前台列表筛选：合集 / 角色 / 年份 / 「仅 Holt」——逻辑在 `inc/work-data.php` + `archive-work.php`。

## 6. 安全习惯（移动端也有同类坑）

- 输出到 HTML：用 `esc_html` / `esc_attr` / `esc_url`（≈ 不要把用户输入直接拼进 WebView）  
- 改库表结构：Holt 用 WP API，**不要**手改 MariaDB 除非你很清楚  
- 密钥、`.env`、管理员密码：**不要提交 git**

## 7. 二开任务清单（练习）

1. 改首页一句 slogan（Customizer 或 `front-page.php`）  
2. 改卡片圆角 / 主色（`main.css` 的 CSS 变量）  
3. 在单作品页加一行「时长」——需先有 meta，再在 `single-work.php` 输出  
4. 本地 compose 起站 → 改 CSS → 对照生产差异  

下一篇：[03-从安装到Holt线上站.md](./03-从安装到Holt线上站.md)
