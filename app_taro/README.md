# 微信小程序（git submodule）

Taro / 微信小程序独立仓。仅挂载，**不进** pnpm workspace，**不进** 网关。

| slug | 路径 | 独立仓 |
|------|------|--------|
| cyhj | `cyhj/` | [cyhj_taro](https://github.com/qxdqhr/cyhj_taro)（葱韵环京） |

LyricNote 也含 Taro 小程序（`packages/miniapp`），但整仓还有 backend / desktop / mobile，不能拆开，挂在 `app_web/lyric-note`。

```bash
git submodule update --init app_taro/cyhj
```
