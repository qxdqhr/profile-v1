# 开源参考项目

| 项目 | 语言 | 能力 | 备注 |
|------|------|------|------|
| [ReaJason/xhs](https://github.com/ReaJason/xhs) | Python | 签名、搜索、发帖、上传 | Demo 依赖此库 |
| [jackwener/xiaohongshu-cli](https://github.com/jackwener/xiaohongshu-cli) | TS | CLI 发帖、互动、通知 | Cookie/二维码登录 |
| [lucasygu/redbook](https://github.com/lucasygu/redbook) | Go | 搜索、发布 | 发布易触发验证码 |
| [BetaStreetOmnis/xhs_ai_publisher](https://github.com/BetaStreetOmnis/xhs_ai_publisher) | Python | Playwright 发帖 + AI 文案 | 适合风控场景 |
| [corlin/helloxiaohong](https://github.com/corlin/helloxiaohong) | Node | Playwright REST API | 定时发布 |
| [PeanutSplash/Spider_XHS](https://github.com/PeanutSplash/Spider_XHS) | Python | 采集 + 创作者发布 | 签名持续更新 |

## 技术路线选择

1. **API + x-s 签名**（本 Demo）：适合脚本化联调、批量调研；签名需跟进更新。
2. **Playwright 创作者后台**：适合真实发帖，维护 DOM 选择器。
3. **混合**：文案/上传用 API，发布步骤人工确认。

## 版本跟进

安装指定版本：

```bash
pip install 'xhs>=0.2.13'
```

若 `edith` 返回签名错误或空数据，优先升级 `xhs` 并查阅上游 Issue。
