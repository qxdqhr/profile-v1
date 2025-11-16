# MMD 功能测试模块

## 📋 概述

本模块用于测试和验证 SA2Kit MMD 库的各项功能。这是一个独立的测试环境，专门用于验证从 mikutalking 迁移到 sa2kit 的 MMD 功能是否正常工作。

## 🎯 测试目标

### 1. 基础功能测试
- ✅ Three.js 场景初始化
- ✅ PMX/PMD 模型加载
- ✅ 纹理智能解析
- ✅ 材质渲染
- ✅ 基础光照

### 2. 动画播放测试
- ✅ VMD 动作加载
- ✅ VMD 相机动画
- ✅ 音频同步播放
- ✅ 播放控制 (play/pause/stop)
- ✅ 物理引擎 (Ammo.js)

### 3. 相机控制测试
- ✅ OrbitControls 基础控制
- ✅ 虚拟摇杆控制
- ✅ 缩放功能
- ✅ 升降功能 (Z轴)
- ✅ 视角重置

### 4. React Hooks 测试
- ✅ useMMDLoader - 资源加载
- ✅ useMMDAnimation - 动画管理
- ✅ useMMDCamera - 相机控制

## 🚀 使用方法

### 访问路由
```
http://localhost:3000/testField/mmdTest
```

### 🆕 新功能：使用 Public 文件
测试页面现已集成 `public/mikutalking` 目录中的实际 MMD 资源：

**模型文件**:
- 简化模型: `/mikutalking/models/test/v4c5.0short.pmx` (基础测试)
- 完整模型: `/mikutalking/models/YYB_Z6SakuraMiku/miku.pmx` (动画测试)

**动画文件**:
- VMD 动作: `/mikutalking/actions/CatchTheWave/mmd_CatchTheWave_motion.vmd`
- 音频文件: `/mikutalking/actions/CatchTheWave/pv_268.wav`

**物理引擎**:
- Ammo.js: `/mikutalking/libs/ammo.wasm.js`

详见 [USAGE_WITH_PUBLIC_FILES.md](./USAGE_WITH_PUBLIC_FILES.md)

### 测试步骤

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **访问测试页面**
   在浏览器中打开 `http://localhost:3000/testField/mmdTest`

3. **选择测试模式**
   - **基础测试**: 验证基本的 3D 场景和模型加载
   - **动画测试**: 验证 VMD 动画播放功能
   - **相机测试**: 验证相机控制和虚拟摇杆
   - **Hooks 测试**: 验证 React Hooks 的功能

4. **查看结果**
   - 控制台日志
   - 页面显示的状态信息
   - 3D 场景的实际效果

## 📁 文件结构

```
mmdTest/
├── README.md                    # 本文档
├── layout.tsx                   # 页面布局
├── page.tsx                     # 主页面
└── components/
    └── MMDTestViewer.tsx        # MMD 测试查看器组件
```

## 🔧 技术栈

- **框架**: Next.js 14 + React 18 + TypeScript
- **3D 渲染**: Three.js + three-stdlib
- **MMD 支持**: MMDLoader + MMDAnimationHelper
- **物理引擎**: Ammo.js
- **样式**: Tailwind CSS

## 📝 测试清单

### 基础功能
- [ ] 场景初始化成功
- [ ] 相机设置正确
- [ ] 光照效果正常
- [ ] 地面网格显示
- [ ] 控制器响应

### 模型加载
- [ ] PMX 模型加载
- [ ] PMD 模型加载
- [ ] 纹理正确显示
- [ ] 材质渲染正常
- [ ] 骨骼结构完整

### 动画播放
- [ ] VMD 动作加载
- [ ] 动画播放流畅
- [ ] 音频同步准确
- [ ] 物理效果正常
- [ ] 播放控制有效

### 相机控制
- [ ] 鼠标拖拽旋转
- [ ] 滚轮缩放
- [ ] 虚拟摇杆控制
- [ ] 升降按钮有效
- [ ] 重置功能正常

### 性能测试
- [ ] FPS 稳定在 60
- [ ] 内存占用合理
- [ ] 加载时间可接受
- [ ] 响应速度快

## 🐛 已知问题

暂无

## 📈 后续计划

### Phase 1 - 基础验证 (当前)
- [x] 创建测试路由
- [x] 基础场景搭建
- [ ] 集成 sa2kit 组件
- [ ] 完成基础测试

### Phase 2 - 功能完善
- [ ] 添加模型上传功能
- [ ] 添加动画选择器
- [ ] 添加性能监控面板
- [ ] 添加调试工具

### Phase 3 - 高级测试
- [ ] 多模型场景测试
- [ ] 复杂动画测试
- [ ] 性能压力测试
- [ ] 移动端适配测试

## 🔗 相关文档

- [SA2Kit 项目文档](../../../../sa2kit/README.md)
- [mikutalking 模块](../../gameField/mikutalking/README.md)
- [MMD 迁移计划](../../../../modules/mmd/MIGRATION_PLAN.md)

## 📞 联系方式

如有问题，请查看项目主 README 或提交 Issue。

---

**创建日期**: 2025-11-15  
**最后更新**: 2025-11-15  
**状态**: 🟡 开发中

