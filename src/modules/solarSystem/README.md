# 🌌 太阳系可视化模块

基于真实天文数据的太阳系3D可视化模块，使用Three.js展示太阳和八大行星的实时位置与轨道运动。

## ✨ 功能特性

### 🎯 核心功能
- **实时太阳系显示**: 基于真实天文算法计算行星位置
- **3D可视化**: 使用Three.js渲染太阳系场景
- **轨道运动**: 实时显示行星轨道运动
- **时间控制**: 支持时间倍率调节（1倍～3650倍速）
- **交互操作**: 鼠标拖拽旋转、滚轮缩放、点击查看详情

### 📱 用户界面
- **响应式设计**: 完美适配桌面端和移动端
- **行星信息面板**: 详细的行星数据展示
- **实时时间显示**: 当前模拟时间和倍率
- **操作提示**: 友好的用户引导
- **错误处理**: 完善的错误提示和恢复机制

### 🔬 科学准确性
- **真实轨道数据**: 基于J2000.0历元的行星轨道参数
- **开普勒轨道力学**: 精确的天体力学计算
- **实时位置**: 根据当前时间计算准确的行星位置
- **物理特性**: 真实的行星大小、质量、颜色等数据

## 🚀 快速开始

### 安装依赖
确保项目已安装以下依赖：
```bash
npm install three @types/three
```

### 基础使用
```tsx
import { SolarSystemPage } from '@/modules/solarSystem';

export default function App() {
  return <SolarSystemPage />;
}
```

### 自定义配置
```tsx
import { SolarSystemViewer } from '@/modules/solarSystem';

const config = {
  scale: {
    distance: 15,  // 距离缩放
    size: 8,       // 大小缩放
    time: 365,     // 时间缩放
  },
  display: {
    showOrbits: true,  // 显示轨道
    showLabels: true,  // 显示标签
    showStars: true,   // 显示星空
    showGrid: false,   // 显示网格
  }
};

export default function CustomSolarSystem() {
  return (
    <SolarSystemViewer
      config={config}
      onPlanetClick={(planet) => console.log('点击了', planet.name)}
      onTimeChange={(time) => console.log('时间变化', time)}
    />
  );
}
```

## 📊 技术架构

### 核心组件
```
├── SolarSystemViewer     # 主要3D查看器组件
├── SolarSystemPage       # 完整页面组件
└── components/           # 子组件
    ├── PlanetInfo       # 行星信息面板（计划中）
    └── TimeController   # 时间控制器（计划中）
```

### 工具函数
```
├── astronomyUtils.ts     # 天文计算工具
├── planetData.ts        # 行星数据
└── sceneUtils.ts        # 场景工具（计划中）
```

### 数据结构
```typescript
interface Planet {
  id: string;
  name: string;
  nameEn: string;
  radius: number;           // 相对地球半径
  mass: number;            // 相对地球质量
  color: string;           // 主要颜色
  orbitalElements: {       // 轨道参数
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    // ...更多轨道参数
  };
  rotationPeriod: number;  // 自转周期（小时）
  orbitalPeriod: number;   // 公转周期（天）
  distanceFromSun: number; // 平均距离（AU）
  moons?: string[];        // 卫星列表
}
```

## 🎮 操作指南

### 鼠标操作
- **拖拽**: 旋转视角，观察不同角度的太阳系
- **滚轮**: 缩放场景，可以拉近或拉远观察
- **点击行星**: 查看行星详细信息

### 移动端操作
- **单指拖拽**: 旋转视角
- **双指缩放**: 缩放场景
- **点击行星**: 查看详细信息

### 界面元素
- **时间显示**: 左上角显示当前模拟时间和倍率
- **操作提示**: 右下角显示操作说明
- **行星信息**: 点击行星后右侧显示详细信息

## 🔧 配置选项

### 缩放配置
```typescript
scale: {
  distance: 10,    // 距离缩放（实际太阳系需要压缩显示）
  size: 5,         // 大小缩放（让行星可见）
  time: 365        // 时间缩放（1天=1年）
}
```

### 显示配置
```typescript
display: {
  showOrbits: true,   // 显示轨道线
  showLabels: true,   // 显示行星标签
  showStars: true,    // 显示背景星空
  showGrid: false     // 显示参考网格
}
```

### 质量配置
```typescript
quality: {
  planetSegments: 32,    // 行星球体分段数
  orbitSegments: 128,    // 轨道线分段数
  enableShadows: false,  // 启用阴影
  enableBloom: false     // 启用光晕效果
}
```

## 🌍 行星数据

模块包含完整的太阳系数据：

| 天体 | 中文名 | 英文名 | 特色 |
|------|--------|--------|------|
| ☀️ | 太阳 | Sun | 太阳系的中心恒星 |
| ☿️ | 水星 | Mercury | 距离太阳最近，温差极大 |
| ♀️ | 金星 | Venus | 最热的行星，逆向自转 |
| 🌍 | 地球 | Earth | 我们的家园，唯一有生命 |
| ♂️ | 火星 | Mars | 红色行星，有巨大火山 |
| ♃ | 木星 | Jupiter | 最大行星，有大红斑 |
| ♄ | 土星 | Saturn | 有美丽的光环系统 |
| ♅ | 天王星 | Uranus | 侧躺自转的冰巨星 |
| ♆ | 海王星 | Neptune | 有最强风暴的行星 |

## 🔮 未来计划

### 近期目标
- [ ] 添加时间控制器组件
- [ ] 增强行星信息面板
- [ ] 添加设置面板
- [ ] 支持行星纹理贴图

### 长期目标
- [ ] 添加卫星系统
- [ ] 支持小行星带
- [ ] 增加彗星轨道
- [ ] VR/AR支持
- [ ] 性能优化（LOD系统）

## 🐛 故障排除

### 常见问题

**Q: 页面加载很慢或无法显示？**
A: 检查Three.js依赖是否正确安装，确保浏览器支持WebGL。

**Q: 行星位置看起来不对？**
A: 这是正常的，为了显示效果，距离和大小都进行了缩放处理。

**Q: 移动端操作不流畅？**
A: 可以通过降低quality配置中的分段数来提升性能。

**Q: 点击行星没有反应？**
A: 确保传入了onPlanetClick回调函数，某些小行星可能较难点击。

### 性能优化建议
1. 降低planetSegments和orbitSegments数值
2. 关闭不必要的显示选项（如showStars）
3. 禁用阴影和光晕效果
4. 在移动端使用较低的配置

## 📄 许可证

MIT License - 请查看项目根目录的LICENSE文件。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

---

**开发者**: AI Assistant  
**创建时间**: 2024年12月  
**版本**: 1.0.0  
**状态**: 基础功能完成 ✅ 