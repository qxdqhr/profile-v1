# Ammo.js 物理引擎库

## 文件说明

此目录包含 Ammo.js 物理引擎的本地副本，用于 MMD 模型的物理效果模拟。

### 文件列表

- `ammo.wasm.js` (385KB) - Ammo.js JavaScript 包装器
- `ammo.wasm.wasm` (636KB) - Ammo.js WebAssembly 二进制文件

### 用途

这些文件被 `MikuMMDViewer.tsx` 组件使用，用于启用 MMD 模型的物理效果，包括：
- 💇‍♀️ 头发物理模拟
- 👗 裙子和衣物的飘动效果
- 🎀 饰品的摆动和碰撞
- 🦴 骨骼物理约束

### 来源

文件来源：https://unpkg.com/three@0.159.0/examples/jsm/libs/

### 版本

- Three.js 版本：0.159.0
- Ammo.js：基于 Bullet Physics 引擎的 WebAssembly 版本

### 使用方式

组件会自动加载这些文件：

```typescript
// 在 MikuMMDViewer.tsx 中
await initAmmo() // 自动从 /mikutalking/libs/ 加载
```

### 注意事项

⚠️ **请勿删除或修改这些文件**，否则 MMD 物理效果将无法工作。

如需更新版本，请从 Three.js 官方仓库下载对应版本的文件。

