# Rhythm Heaven–inspired 开发计划

> 同人节奏小品：玩法致敬，素材原创。横屏、首关纯点按。引擎 Godot 4.7.1。

## 已确认决策

| 项 | 选择 |
|---|---|
| 路径 | `/home/qhr/project/rhythm-heaven-clone` |
| 首关玩法 | 纯点按 |
| 方向 | 横屏 |
| 脚本 | GDScript |
| 首发 | 桌面调试 + Android APK |
| 工作名 | Pulse Parade |

## 阶段

### A — 环境收尾
- [x] 确认 Godot CLI `4.7.1.stable`（`/home/qhr/bin/godot`）
- [x] 对齐 Android SDK：`build-tools;35.0.1`、`ndk;28.1.13356709`、`cmake;3.10.2.4988404`
- [x] Godot Editor Settings 已配置 JDK / SDK / debug.keystore
- [x] 安装 export templates `4.7.1.stable`（`scripts/install_export_templates.sh`）
- [x] CLI 导出 debug APK 冒烟（`export/PulseParade-debug.apk`）

### B — 项目骨架
- [x] Boot → Title → RhythmStage → Result（+ Calibrate）
- [x] Autoload：`AudioClock`、`InputRouter`、`Judgement`、`SaveData`
- [x] 横屏 1280×720，触摸/键鼠点按
- [x] `export_presets.cfg`（`com.pulseparade.game`）

### C — 核心节奏引擎
- [x] 音频/系统时间轴时钟 + offset 校准
- [x] Chart JSON（BPM、offset、notes）
- [x] 判定窗：Perfect / Great / OK / Miss
- [x] 键盘 + 触摸；延迟校准写入存档

### D — 首关 MVP（纯点按）
- [x] Demo 节拍轨（程序提示音 + JSON 谱面）
- [x] 结算：命中率、连击、评级
- [ ] 替换为正式短曲 + 简易角色动画

### E — 内容扩展
- Chart 工具 / 关卡插件化
- 追加滑动、连打等玩法

### F — Android / Web 打磨
- [x] Android debug APK
- [x] Web 单线程导出 + profile-v1 `/games/pulse-parade/` 旁路
- 真机延迟、图标、正式短曲

## 合规
不使用原作 ROM / 原曲 / 原图 / 商标作发行名。

## 第一里程碑交付
1. 编辑器可玩纯点按关卡 — 已完成
2. 可安装 debug APK — 已完成（`export/PulseParade-debug.apk`，已签名校验）
3. README：校准延迟与加谱说明 — 已完成
