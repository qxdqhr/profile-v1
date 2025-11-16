# SA2Kit 项目结构

本文档描述了 SA2Kit 库的完整项目结构。

---

## 📁 目录结构

```
sa2kit/
├── src/                              # 源代码目录
│   ├── components/                   # React 组件
│   │   ├── MMDViewer/               # MMD 查看器组件
│   │   │   ├── MMDViewer.tsx       # 主组件实现
│   │   │   ├── types.ts            # 组件类型定义
│   │   │   └── index.ts            # 导出文件
│   │   │
│   │   ├── MMDAnimationPlayer/      # 动画播放器组件
│   │   │   ├── MMDAnimationPlayer.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── MMDCameraControl/        # 相机控制组件
│   │       ├── MMDCameraControl.tsx
│   │       ├── types.ts
│   │       └── index.ts
│   │
│   ├── hooks/                        # React Hooks
│   │   ├── useMMDLoader.ts          # 资源加载 Hook
│   │   ├── useMMDAnimation.ts       # 动画管理 Hook
│   │   ├── useMMDCamera.ts          # 相机控制 Hook
│   │   └── index.ts                 # 导出文件
│   │
│   ├── types/                        # 类型定义
│   │   ├── viewer.ts                # 查看器类型
│   │   ├── animation.ts             # 动画类型
│   │   ├── camera.ts                # 相机类型
│   │   └── index.ts                 # 导出文件
│   │
│   ├── utils/                        # 工具函数
│   │   ├── texturePathResolver.ts   # 纹理路径解析
│   │   └── index.ts                 # 导出文件
│   │
│   ├── constants/                    # 常量配置
│   │   ├── defaults.ts              # 默认配置
│   │   └── index.ts                 # 导出文件
│   │
│   └── index.ts                      # 主入口文件
│
├── examples/                         # 示例代码
│   ├── basic-usage.tsx              # 基础使用示例
│   └── advanced-usage.tsx           # 高级使用示例
│
├── docs/                             # 文档目录（可选）
│
├── dist/                             # 构建输出（自动生成）
│
├── node_modules/                     # 依赖包（自动生成）
│
├── package.json                      # NPM 包配置
├── tsconfig.json                     # TypeScript 配置
├── tsup.config.ts                    # 构建工具配置
├── .eslintrc.js                      # ESLint 配置
├── .prettierrc                       # Prettier 配置
├── .gitignore                        # Git 忽略规则
│
├── README.md                         # 项目说明
├── QUICK_START.md                    # 快速开始
├── CONTRIBUTING.md                   # 贡献指南
├── LICENSE                           # 许可证
│
├── MIGRATION_FROM_PROFILE.md        # 迁移计划
├── MIGRATION_STATUS.md              # 迁移状态
├── MIGRATION_SUMMARY.md             # 迁移总结
├── MIGRATION_COMPLETE.md            # 迁移完成报告
└── PROJECT_STRUCTURE.md             # 本文档
```

---

## 📦 核心模块说明

### 1. Components (`src/components/`)

#### MMDViewer
**功能**: 核心 MMD 模型查看器组件

**文件**:
- `MMDViewer.tsx` (800 行) - 主组件实现
- `types.ts` (100 行) - Props 和类型定义
- `index.ts` (5 行) - 导出

**职责**:
- Three.js 场景管理
- PMX 模型加载
- 纹理处理
- 相机控制
- 动画集成
- 物理引擎

#### MMDAnimationPlayer
**功能**: MMD 动画播放器组件

**文件**:
- `MMDAnimationPlayer.tsx` (350 行) - 主组件实现
- `types.ts` (80 行) - Props 和类型定义
- `index.ts` (5 行) - 导出

**职责**:
- VMD 动作加载
- VMD 相机动画
- 音频同步
- 播放控制
- 进度追踪

#### MMDCameraControl
**功能**: 相机控制 UI 组件

**文件**:
- `MMDCameraControl.tsx` (400 行) - 主组件实现
- `types.ts` (70 行) - Props 和类型定义
- `index.ts` (5 行) - 导出

**职责**:
- 虚拟摇杆
- 缩放控制
- 升降控制
- 重置功能
- UI 渲染

---

### 2. Hooks (`src/hooks/`)

#### useMMDLoader
**功能**: MMD 资源加载 Hook

**文件**: `useMMDLoader.ts` (180 行)

**返回值**:
- `loadState` - 加载状态
- `resource` - 已加载资源
- `loadModel` - 加载模型函数
- `loadMotion` - 加载动作函数
- `loadCameraMotion` - 加载相机动画函数
- `reset` - 重置函数

#### useMMDAnimation
**功能**: MMD 动画管理 Hook

**文件**: `useMMDAnimation.ts` (200 行)

**返回值**:
- `state` - 动画状态
- `play` - 播放
- `pause` - 暂停
- `stop` - 停止
- `seek` - 跳转
- `update` - 更新

#### useMMDCamera
**功能**: MMD 相机控制 Hook

**文件**: `useMMDCamera.ts` (180 行)

**返回值**:
- `cameraRef` - 相机引用
- `controlsRef` - 控制器引用
- `controls` - 控制方法
- `initCamera` - 初始化

---

### 3. Types (`src/types/`)

#### viewer.ts
**内容**: MMDViewer 相关类型
- `MMDViewerProps`
- `CameraControls`
- `AnimationControls`

#### animation.ts
**内容**: 动画相关类型
- `MMDAnimation`
- `PlaybackState`
- `AnimationLoadState`

#### camera.ts
**内容**: 相机相关类型
- `CameraConfig`
- `CameraState`
- `CameraControlConfig`

---

### 4. Utils (`src/utils/`)

#### texturePathResolver.ts
**功能**: 智能解析 MMD 纹理路径

**类**:
- `TexturePathResolver` - 路径解析器类

**函数**:
- `resolveTexturePath()` - 便捷函数

**特性**:
- Windows 路径转换
- URL 编码
- 子目录智能识别
- 路径去重

---

### 5. Constants (`src/constants/`)

#### defaults.ts
**内容**: 默认配置常量

**导出**:
- `DEFAULT_VIEWER_PROPS`
- `DEFAULT_CAMERA_POSITION`
- `DEFAULT_TARGET_POSITION`
- `DEFAULT_LIGHT_SETTINGS`
- `DEFAULT_GROUND_SETTINGS`
- `DEFAULT_PHYSICS_SETTINGS`
- `DEFAULT_ANIMATION_SETTINGS`
- `DEFAULT_LOADING_MESSAGES`

---

## 🔗 模块依赖关系

```
index.ts
  ├─► components/
  │     ├─► MMDViewer
  │     ├─► MMDAnimationPlayer
  │     └─► MMDCameraControl
  │
  ├─► hooks/
  │     ├─► useMMDLoader
  │     ├─► useMMDAnimation
  │     └─► useMMDCamera
  │
  ├─► types/
  │     ├─► viewer
  │     ├─► animation
  │     └─► camera
  │
  ├─► utils/
  │     └─► texturePathResolver
  │
  └─► constants/
        └─► defaults
```

---

## 📊 代码统计

| 模块 | 文件数 | 行数 |
|------|--------|------|
| **components/** | 9 | ~1,600 |
| **hooks/** | 4 | ~500 |
| **types/** | 4 | ~200 |
| **utils/** | 2 | ~250 |
| **constants/** | 2 | ~150 |
| **examples/** | 2 | ~600 |
| **总计** | 22 | ~3,320 |

---

## 🚀 构建产物

构建后的 `dist/` 目录结构：

```
dist/
├── index.js              # CommonJS 格式
├── index.mjs             # ES Module 格式
├── index.d.ts            # TypeScript 类型定义
└── index.d.mts           # TypeScript 类型定义 (ESM)
```

---

## 📝 文档结构

```
docs/
├── README.md                     # 项目主页
├── QUICK_START.md                # 快速开始
├── CONTRIBUTING.md               # 贡献指南
├── MIGRATION_FROM_PROFILE.md    # 迁移计划
├── MIGRATION_STATUS.md          # 迁移状态
├── MIGRATION_SUMMARY.md         # 迁移总结
├── MIGRATION_COMPLETE.md        # 迁移完成
└── PROJECT_STRUCTURE.md         # 本文档
```

---

## 🔧 配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | NPM 包配置 |
| `tsconfig.json` | TypeScript 编译配置 |
| `tsup.config.ts` | 构建工具配置 |
| `.eslintrc.js` | 代码检查规则 |
| `.prettierrc` | 代码格式化规则 |
| `.gitignore` | Git 忽略规则 |

---

## 📦 NPM 包信息

**包名**: `sa2kit`  
**版本**: `1.0.0`  
**主入口**: `dist/index.js`  
**Module 入口**: `dist/index.mjs`  
**类型定义**: `dist/index.d.ts`  

**导出内容**:
- 3 个 React 组件
- 3 个 React Hooks
- 15+ 个 TypeScript 类型
- 1 个工具类
- 8+ 个常量配置

---

**最后更新**: 2025-11-15  
**文档版本**: 1.0.0

