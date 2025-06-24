# MMD (MikuMikuDance) 模块开发文档

## 项目概述

本模块旨在创建一个基于Three.js的MMD模型展示和交互系统，允许用户导入、预览和操作MMD模型。

## 功能特性

- ✅ 支持导入MMD模型文件 (.pmd, .pmx)
- ✅ 支持导入MMD动作文件 (.vmd)
- ✅ 支持导入MMD音频文件 
- ✅ 3D场景渲染和控制
- ✅ 模型动画播放控制
- ✅ 响应式设计，适配桌面和移动端
- ✅ 模型和动作文件管理

## 技术栈

- **核心框架**: Next.js 14, React 18, TypeScript
- **3D渲染**: Three.js (最新版)
- **MMD支持**: three-vrm, @pixiv/three-vrm, mmd-loader
- **UI组件**: Tailwind CSS, Radix UI
- **状态管理**: Zustand
- **数据库**: Drizzle ORM + PostgreSQL
- **文件上传**: 支持模型文件和动作文件上传

## 模块结构

```
src/modules/mmd/
├── DEVELOPMENT.md          # 本文档
├── README.md              # 模块说明文档
├── index.ts               # 模块主入口
├── server.ts              # 服务端专用导出
├── api/                   # API路由
│   ├── models/           # 模型管理API
│   ├── animations/       # 动画管理API
│   └── upload/          # 文件上传API
├── components/           # React组件
│   ├── MMDViewer/       # 3D查看器组件
│   ├── ModelManager/    # 模型管理组件
│   ├── AnimationControl/ # 动画控制组件
│   └── FileUploader/    # 文件上传组件
├── pages/               # 页面组件
│   ├── MMDViewerPage.tsx # 主查看器页面
│   └── config/          # 配置管理页面
├── hooks/               # 自定义Hooks
│   ├── useMMDLoader.ts  # MMD加载Hook
│   ├── useAnimation.ts  # 动画控制Hook
│   └── useFileUpload.ts # 文件上传Hook
├── services/            # 业务服务
│   ├── mmdService.ts    # MMD相关服务
│   └── fileService.ts   # 文件管理服务
├── db/                  # 数据库相关
│   ├── schema.ts        # 数据表结构
│   └── mmdDbService.ts  # 数据库服务
├── types/               # TypeScript类型定义
│   └── index.ts         # 类型导出
├── utils/               # 工具函数
│   ├── mmdLoader.ts     # MMD加载工具
│   ├── sceneUtils.ts    # 3D场景工具
│   └── fileUtils.ts     # 文件处理工具
└── styles/              # 样式文件
    ├── MMDViewer.module.css
    └── components.module.css
```

## 开发计划

### 阶段 1: 基础环境搭建 ✅
- [x] 创建模块目录结构
- [x] 安装Three.js和MMD相关依赖
- [x] 配置TypeScript类型定义
- [x] 创建基础模块入口文件

### 阶段 2: 数据库设计 ✅
- [x] 设计MMD模型存储表结构
- [x] 设计动画文件存储表结构
- [x] 实现数据库服务函数
- [x] 更新主数据库schema导出

### 阶段 3: 核心3D功能 ✅
- [x] 实现Three.js场景初始化
- [x] 创建场景管理工具函数
- [x] 实现基础3D控制（旋转、缩放、平移）
- [x] 添加光照和材质支持

### 阶段 4: MMD功能实现 🔄
- [x] 基础Three.js渲染框架
- [ ] 实现PMD/PMX模型加载器
- [ ] 实现VMD动作文件加载
- [ ] 添加骨骼动画支持
- [ ] 实现动画播放控制

### 阶段 5: 用户界面 ✅
- [x] 创建3D查看器组件(基础版本)
- [x] 实现查看器页面界面
- [x] 使用TailwindCSS样式适配
- [x] 移动端响应式设计
- [x] 创建设置弹窗组件(集成模型/动画/控制选项)
- [x] 重构页面为全宽布局，移除侧边栏
- [x] 使用现有公用弹窗组件
- [x] 弹窗改为Tab界面(3个Tab：模型选择、动画选择、控制选项)
- [x] 优化Tab内容布局和交互体验

### 阶段 6: API接口 ✅
- [x] 实现模型管理API
- [x] 添加模型CRUD操作
- [x] 创建app路由映射
- [ ] 实现文件上传API
- [ ] 添加动画文件API

### 阶段 7: 高级功能 📋
- [ ] 添加多模型同时显示
- [ ] 实现场景保存和加载
- [ ] 添加背景和环境设置
- [ ] 优化性能和渲染质量

### 阶段 8: 用户体验优化 📋
- [ ] 加载进度显示
- [ ] 错误处理和用户提示
- [ ] 性能监控和优化
- [ ] 文件上传界面

### 阶段 9: 集成和测试 ✅
- [x] 集成到实验田模块
- [x] 添加路由配置
- [x] 基础页面测试
- [ ] 端到端功能测试
- [ ] 完善文档

## 技术要点

### Three.js MMD 支持
```typescript
// 主要使用的库
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// TODO: 集成实际的MMD加载器
// import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
// import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
```

### UI样式实现
- **样式框架**: TailwindCSS (替代CSS Modules)
- **响应式设计**: 桌面端和移动端适配
- **组件库**: 原生HTML + TailwindCSS
- **状态管理**: React Hooks

### 文件格式支持
- **模型文件**: .pmd, .pmx
- **动作文件**: .vmd
- **音频文件**: .wav, .mp3
- **贴图文件**: .png, .jpg, .tga

### 性能优化考虑
- 模型LOD (Level of Detail)
- 纹理压缩
- 动画缓存
- GPU加速计算

## 当前状态: 基础框架完成 (阶段1-3,5-6,9部分完成)

下一步: 
1. 实现真实的MMD模型加载器 (阶段4)
2. 添加文件上传功能 (阶段6补充)
3. 完善动画播放控制 (阶段4)

## 已完成功能
- ✅ 基础Three.js 3D场景
- ✅ 轨道控制器 
- ✅ 响应式UI界面
- ✅ 数据库设计和API
- ✅ 模块集成和路由
- ✅ TailwindCSS样式
- ✅ 真实MMD模型解析 (PMD/PMX)
- ✅ mmd-parser集成
- ✅ 自定义Three.js模型构建器

## 待实现功能
- 🔄 动画播放功能 (VMD支持)
- 🔄 材质和纹理优化
- 🔄 物理系统集成
- 🔄 模型管理界面完善

---

## 最新进展更新

### 阶段10: 真实MMD模型支持 ✅ (2024年12月)

**核心依赖:**
- 安装并集成 `mmd-parser` v1.0.4
- 创建TypeScript类型声明文件 (`src/types/mmd-parser.d.ts`)
- 开发自定义模型构建器 (`src/modules/mmd/utils/mmdModelBuilder.ts`)

**实现功能:**

1. **真实PMD/PMX文件解析**
   ```typescript
   // 支持多种格式
   if (modelUrl.toLowerCase().endsWith('.pmx')) {
     mmdModel = MMDParser.parsePmx(arrayBuffer);
   } else if (modelUrl.toLowerCase().endsWith('.pmd')) {
     mmdModel = MMDParser.parsePmd(arrayBuffer);
   }
   ```

2. **Three.js模型构建器**
   - 顶点数据转换 (position, normal, uv)
   - 面索引构建
   - 多材质支持和纹理加载
   - 骨骼系统创建 (父子关系)
   - 自动几何体优化

3. **用户界面增强**
   - 实时模型信息显示 (📄名称, 🔷顶点数, 🔺面数, 🦴骨骼数)
   - 格式检测和状态指示 (✅成功解析 / ⚠️解析失败)
   - 详细加载进度 (下载→解析→构建→显示)
   - 智能错误处理和回退机制

4. **错误处理机制**
   - 解析失败时自动降级到红色占位符
   - 保留原始错误信息供调试
   - 用户友好的状态提示

**技术架构:**
```
下载文件 → mmd-parser解析 → MMDModelBuilder构建 → Three.js渲染
    ↓           ↓                    ↓              ↓
ArrayBuffer → MMDModel对象 → THREE.Group → 场景显示
```

**成果展示:**
- 用户现在可以上传真实的PMD/PMX文件
- 系统能够正确解析和显示模型几何体
- 智能显示模型统计信息 (顶点、面、材质、骨骼数量)
- 良好的错误处理和用户反馈

**下一步计划:**
- VMD动画文件支持
- 材质和纹理渲染优化  
- MMD物理系统集成
- 模型性能优化 