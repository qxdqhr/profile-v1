# 原生 Android（git submodule）

Gradle / Java 应用，不是 `app_mobile` 里的 React Native。仅挂载，**不进** pnpm workspace。

| slug | 路径 | 独立仓 |
|------|------|--------|
| off-work-time | `off-work-time/` | [offWorkTimeApp](https://github.com/qxdqhr/offWorkTimeApp) |
| lyric-notebook | `lyric-notebook/` | [LyricNotebook](https://github.com/qxdqhr/LyricNotebook) |

```bash
git submodule update --init app_android/off-work-time app_android/lyric-notebook
```
