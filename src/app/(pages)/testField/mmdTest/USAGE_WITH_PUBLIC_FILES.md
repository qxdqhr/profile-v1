# MMD 测试页面 - 使用 Public 文件说明

## 📋 概述

MMD 测试页面已更新为使用 `public/mikutalking` 文件夹中的实际 MMD 资源文件，包括模型、动画和音频。

**更新日期**: 2025-11-15  
**版本**: 2.0.0

---

## 📦 使用的文件

### 模型文件

#### 1. 简化模型（基础测试）
```
路径: /mikutalking/models/test/v4c5.0short.pmx
用途: 基础测试模式
特点: 轻量级，加载快速
```

#### 2. 完整模型（动画测试）
```
路径: /mikutalking/models/YYB_Z6SakuraMiku/miku.pmx
用途: 动画测试、相机测试、Hooks 测试
特点: 完整细节，支持物理效果
纹理: /mikutalking/models/YYB_Z6SakuraMiku/tex/
      /mikutalking/models/YYB_Z6SakuraMiku/spa/
      /mikutalking/models/YYB_Z6SakuraMiku/toon/
```

### 动画文件

#### VMD 动作文件
```
路径: /mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd
名称: Catch The Wave 舞蹈动作
用途: 动画测试模式
```

#### VMD 相机文件
```
路径: /mikutalking/actions/CatchTheWave/camera.vmd
名称: 相机动画轨迹
用途: 相机动画（可选）
```

### 音频文件

```
路径: /mikutalking/actions/CatchTheWave/pv_268.wav
名称: 背景音乐
用途: 音频同步播放
```

### 物理引擎

```
路径: /mikutalking/libs/ammo.wasm.js
      /mikutalking/libs/ammo.wasm.wasm
名称: Ammo.js 物理引擎
用途: MMD 物理模拟（头发、裙子等）
```

---

## 🎯 测试模式说明

### 1. 基础测试模式
**使用模型**: v4c5.0short.pmx（简化模型）

**功能**:
- ✅ PMX 模型加载
- ✅ 纹理显示
- ✅ 基础材质渲染
- ✅ 场景光照

**特点**: 快速加载，适合测试基础渲染功能

### 2. 动画测试模式
**使用模型**: miku.pmx（完整模型）  
**使用动画**: mmd_CatchTheWave_motion.vmd

**功能**:
- ✅ VMD 动作加载
- ✅ 物理引擎（Ammo.js）
- ✅ 播放/停止控制
- ✅ 动画循环

**操作**:
1. 等待模型和动画加载完成
2. 点击"播放动画"按钮
3. 观察米库的舞蹈动作
4. 点击"停止动画"停止播放

### 3. 相机测试模式
**使用模型**: miku.pmx（完整模型）

**功能**:
- ✅ OrbitControls 相机控制
- ✅ 鼠标拖拽旋转
- ✅ 滚轮缩放
- ✅ 键盘控制

**操作**:
- **左键拖拽**: 旋转视角
- **滚轮**: 缩放视角
- **右键拖拽**: 平移视角

### 4. Hooks 测试模式
**使用模型**: miku.pmx（完整模型）

**功能**:
- ✅ useMMDLoader 测试
- ✅ useMMDAnimation 测试
- ✅ useMMDCamera 测试

---

## 🚀 快速开始

### 访问页面
```
方式一: http://localhost:3000/testField/mmdTest
方式二: http://localhost:3000/testField → 搜索 "MMD 功能测试"
```

### 测试流程

#### 步骤 1: 启动服务器
```bash
pnpm dev
```

#### 步骤 2: 访问测试页面
在浏览器中打开上述任一 URL

#### 步骤 3: 选择测试模式
点击顶部导航栏的测试模式按钮

#### 步骤 4: 等待加载
观察加载进度提示

#### 步骤 5: 开始测试
根据不同模式进行相应操作

---

## 📊 加载流程

### 基础测试模式
```
1. 初始化 Ammo.js 物理引擎
2. 创建 Three.js 场景
3. 加载简化模型 (v4c5.0short.pmx)
4. 显示模型
```

### 动画测试模式
```
1. 初始化 Ammo.js 物理引擎
2. 创建 Three.js 场景
3. 加载完整模型 (miku.pmx)
4. 加载 VMD 动作文件
5. 初始化 MMDAnimationHelper
6. 显示播放控制按钮
```

---

## 🎨 UI 界面

### 顶部导航栏
- **标题**: SA2Kit MMD 测试
- **版本标签**: v1.0.0
- **测试模式切换**: 4 个按钮
- **显示/隐藏信息**: 切换信息面板

### 信息面板（左上角）
- 当前测试模式
- 功能特性列表
- 实时状态信息

### 3D 视口（中央）
- MMD 模型显示区域
- 支持鼠标交互
- 实时渲染

### 底部状态栏
- Three.js 版本信息
- SA2Kit 版本
- 操作提示

### 动画控制（左下角，仅动画模式）
- 播放按钮（绿色）
- 停止按钮（红色）

### 测试模式标识（右下角）
- 显示当前测试模式

---

## 🐛 故障排除

### 问题 1: 模型加载失败
**症状**: 显示"模型加载失败"错误  
**原因**: 文件路径不正确或文件不存在  
**解决方案**:
1. 检查 `public/mikutalking/models/` 目录是否存在
2. 确认模型文件完整
3. 查看浏览器控制台的详细错误信息
4. 系统会自动显示后备立方体模型

### 问题 2: 动画加载失败
**症状**: 模型显示正常但无法播放动画  
**原因**: VMD 文件加载失败或 Ammo.js 未正确初始化  
**解决方案**:
1. 检查 `public/mikutalking/actions/` 目录
2. 确认 Ammo.js 文件存在于 `public/mikutalking/libs/`
3. 查看控制台日志
4. 动画加载失败不影响模型显示

### 问题 3: 纹理显示不正确
**症状**: 模型显示但纹理缺失或错误  
**原因**: 纹理路径解析失败  
**解决方案**:
1. 检查纹理文件夹结构
2. 确认 tex/, spa/, toon/ 文件夹存在
3. 查看控制台的纹理加载日志

### 问题 4: 物理效果异常
**症状**: 动画播放但物理效果不正常  
**原因**: Ammo.js 未正确加载  
**解决方案**:
1. 刷新页面重新加载
2. 检查 Network 标签确认 Ammo.js 加载成功
3. 查看控制台错误信息

---

## 📈 性能指标

### 预期性能

#### 简化模型（v4c5.0short.pmx）
- 加载时间: < 3 秒
- FPS: 60
- 内存占用: < 100MB

#### 完整模型（miku.pmx）
- 加载时间: < 8 秒
- FPS: 60
- 内存占用: < 200MB

#### 动画播放
- 加载时间: < 5 秒（额外）
- FPS: 50-60
- 内存占用: < 250MB

---

## 💡 开发提示

### 添加新模型
1. 将模型文件放入 `public/mikutalking/models/`
2. 更新 `MMDTestViewer.tsx` 中的 `modelPath`
3. 确保纹理文件结构正确

### 添加新动画
1. 将 VMD 文件放入 `public/mikutalking/actions/`
2. 更新 `loadAnimation` 函数中的 `motionPath`
3. （可选）添加音频文件

### 调试技巧
1. 打开浏览器开发者工具
2. 查看 Console 标签的日志输出
3. 查看 Network 标签确认文件加载
4. 使用 Performance 标签分析性能

---

## 🔗 相关文档

- [README.md](./README.md) - 详细文档
- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [SUMMARY.md](./SUMMARY.md) - 完成总结
- [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) - 实现报告

---

## 📞 技术支持

### 控制台日志说明
```
🎭 - 模型相关操作
💃 - 动画相关操作
🎵 - 音频相关操作
✅ - 成功操作
❌ - 失败操作
⚠️ - 警告信息
📦 - 加载进度
▶️ - 播放操作
⏹️ - 停止操作
```

---

**创建日期**: 2025-11-15  
**最后更新**: 2025-11-15  
**版本**: 2.0.0  
**状态**: ✅ 完全集成 Public 文件

