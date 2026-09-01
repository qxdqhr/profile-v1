# WordPress 子站（git submodule）

与 `games/` 类似，每个 WordPress 主题站为独立公开仓，以 submodule 挂载在 `wordpress/<slug>/`。

| slug | 路径 | 独立仓 | 公网 |
|------|------|--------|------|
| holt | `wordpress/holt/` | [profile-v1-wordpress-holt](https://github.com/qxdqhr/profile-v1-wordpress-holt) | `/wp/holt/` |

## 克隆父仓后

```bash
git submodule update --init --recursive
```

## 目录约定

- `wordpress/<slug>/`：主题源码（挂载为 `wp-content/themes/<theme-dir>`）+ 可选 `data/` 种子 JSON
- `deploy/wordpress/`：旁路基建（dev compose、ADD-SITE、php 教程）；**不进 submodule**

加新站见 [`deploy/wordpress/ADD-SITE.md`](../deploy/wordpress/ADD-SITE.md)。
