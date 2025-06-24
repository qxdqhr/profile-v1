# MMD模块 - VMD动画格式支持

## VMD格式说明

**VMD（Vocaloid Motion Data）** 是MikuMikuDance的动画数据格式，与模型文件不同：

### 文件类型对比

| 格式 | 用途 | 包含内容 |
|------|------|----------|
| **PMD/PMX** | 3D模型 | 几何体、材质、骨骼结构、物理设置 |
| **VMD** | 动画数据 | 骨骼动画、表情动画、相机运动 |

### VMD包含的数据类型

1. **骨骼动画（Bone Animation）**
   - 骨骼位置和旋转的关键帧
   - 贝塞尔曲线插值数据
   - 时间轴信息

2. **表情动画（Morph Animation）**
   - 面部表情变化
   - 权重值变化曲线

3. **相机动画（Camera Animation）**
   - 相机位置、旋转、视角
   - 相机运动轨迹

4. **灯光动画（Light Animation）**
   - 光源颜色、方向变化

5. **IK设置**
   - IK开关状态
   - IK约束设置

## 实现功能

### ✅ 已支持的功能

1. **文件解析**
   - ✅ 支持 `.vmd` 文件导入
   - ✅ 解析动画数据结构
   - ✅ 显示动画统计信息

2. **数据展示**
   - ✅ 骨骼关键帧数量
   - ✅ 表情关键帧数量  
   - ✅ 相机关键帧数量
   - ✅ 动画名称显示

3. **UI集成**
   - ✅ 统一的文件选择界面
   - ✅ 动画文件专用图标（🎬）
   - ✅ 详细的解析日志

### 🚧 限制和待开发功能

1. **动画播放**
   - ❌ 目前只解析不播放
   - ❌ 需要集成Three.js AnimationMixer
   - ❌ 需要模型+动画联合播放

2. **高级功能**
   - ❌ 动画时间轴编辑
   - ❌ 关键帧可视化
   - ❌ 动画预览和控制

## 使用方法

### 1. 导入VMD文件

```typescript
// 在MMD查看器中选择 .vmd 文件
// 系统会自动识别为动画文件
```

### 2. 查看动画信息

导入VMD文件后，界面会显示：
- 🎬 VMD动画已加载
- 动画名称
- 骨骼关键帧数量
- 表情关键帧数量
- 相机关键帧数量

### 3. 控制台调试

```javascript
// 控制台会输出详细的VMD解析信息
{
  name: "动画名称",
  bones: 1234,      // 骨骼关键帧数
  morphs: 56,       // 表情关键帧数
  cameras: 78,      // 相机关键帧数
  lights: 12        // 灯光关键帧数
}
```

## 技术实现

### 解析流程

```
VMD文件 → mmd-parser.parseVmd() → 动画数据对象 → 可视化显示
```

### 数据结构

```typescript
interface VMDData {
  header: {
    signature: string;
    name: string;
  };
  bone: Array<{
    frame: number;
    name: string;
    position: [number, number, number];
    quaternion: [number, number, number, number];
    bezier: BezierData;
  }>;
  morph: Array<{
    frame: number;
    name: string;
    weight: number;
  }>;
  camera: Array<{
    frame: number;
    position: [number, number, number];
    rotation: [number, number, number];
    // ... 更多相机数据
  }>;
  // ... 其他数据
}
```

## 未来计划

1. **动画播放系统**
   - 集成Three.js AnimationMixer
   - 支持播放/暂停/快进
   - 时间轴控制界面

2. **模型+动画联合**
   - 同时加载PMX模型和VMD动画
   - 实时动画播放
   - 骨骼绑定验证

3. **高级功能**
   - 动画编辑器
   - 关键帧可视化
   - 动画导出功能

## 注意事项

1. **兼容性**: VMD文件需要与对应的模型匹配才能正确播放
2. **文件大小**: 复杂动画的VMD文件可能较大
3. **性能**: 目前只做解析显示，不进行实际动画计算

## 参考资料

- [VMD文件格式规范](http://blog.goo.ne.jp/torisu_tetosuki/e/209ad341d3ece2b1b4df24abf619d6e4)
- [mmd-parser库文档](https://github.com/takahirox/mmd-parser)
- [Three.js AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer) 