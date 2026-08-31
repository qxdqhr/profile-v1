# Holt 作品集 WordPress — 开发进度

## 目标

- 路径 `/wp/holt/`，主题 `holt-portfolio`
- B 站个人空间 + 作品 PV 展示，可选独立音频链接

## Checklist

- [x] personal → holt 旁路重命名（compose / nginx / deploy 脚本 / CI / smoke）
- [x] `ensure-wordpress-database.sh` 幂等建库 `wp_holt`
- [x] 主题脚手架 `themes/holt-portfolio/`
- [x] CPT `work` + taxonomy `work_role` + meta（bilibili_url / audio_url / work_year）
- [x] B 站 BV 解析与 iframe 嵌入
- [x] Customizer 默认值（Holt、`https://b23.tv/ylj7b9x`）
- [x] 首页 / 作品库 / 单作品 / 关于 / 联系模板
- [ ] 生产：GitHub Secret `WP_HOLT_PUBLIC_URL` 更新
- [ ] 生产：WP 安装向导 + 激活主题 + 录入作品
- [ ] 验收：`https://qhr062.top/wp/holt/` 移动端 + B 站跳转

## 本地验证

```bash
cd deploy/wordpress
cp -n .env.example .env
docker compose -f docker-compose.dev.yml --env-file .env up -d
# http://127.0.0.1:18080/wp/holt/
```

## 后台录入示例

1. 作品 → 添加：标题、特色图片、B 站链接（BV 或 b23.tv）
2. 参与角色：作曲 / 编曲 / 混音 等
3. 外观 → 自定义：填写联系邮箱、微信
