# Mikutap 模块开发文档

## 版本信息
- 版本: v1.1.0
- 更新日期: 2024-12-19
- 状态: 配置功能完善完成

## 功能概述

Mikutap 是一个音乐互动游戏模块，允许用户通过点击、拖拽或键盘按键来演奏音效。模块支持完全可配置化的网格布局和音效设置。

## 核心功能

### 1. 音效演奏
- **点击演奏**: 点击屏幕任意位置播放对应网格位置的音效
- **拖拽演奏**: 支持连续拖拽播放，具备节流控制
- **键盘演奏**: 支持键盘按键直接触发音效
- **触摸优化**: 完美支持移动设备触摸操作

### 2. 网格配置系统
- **自定义网格尺寸**: 支持1-10行，1-10列的灵活配置
- **单元格编辑**: 每个网格单元格都可以独立配置
- **音效类型**: 支持钢琴(piano)、鼓点(drum)、特效(synth)三种音效类型
- **波形选择**: 支持正弦波、方波、锯齿波、三角波四种波形
- **频率调节**: 支持20Hz-2000Hz的频率范围
- **音量控制**: 独立的单元格音量控制
- **图标自定义**: 支持emoji图标自定义
- **颜色主题**: 支持自定义颜色主题

### 3. 视觉效果
- **粒子系统**: 可配置的粒子效果，支持自定义生命周期
- **网格显示**: 帮助模式下显示网格布局和单元格信息
- **实时反馈**: 鼠标/触摸位置实时显示对应音效信息
- **响应式设计**: 支持桌面端和移动端自适应

### 4. 设置系统
- **音量控制**: 全局音量调节
- **交互控制**: 可独立开关键盘和鼠标操作
- **拖拽节流**: 可配置的拖拽节流延迟
- **视觉效果开关**: 可开关粒子效果
- **快捷键支持**: 丰富的快捷键操作

## 技术架构

### 模块结构
```
src/modules/mikutap/
├── pages/
│   ├── SimpleMikutapPage.tsx    # 主功能页面
│   └── ConfigPage.tsx           # 配置管理页面
├── services/
│   └── configService.ts         # 配置服务层
├── utils/
│   └── audioGenerator.ts        # 音频生成器
├── types/
│   └── index.ts                # 类型定义
└── index.ts                    # 模块入口
```

### 数据流
1. **配置加载**: ConfigService从localStorage加载配置
2. **数据传递**: SimpleMikutapPage读取配置数据
3. **音效生成**: AudioGenerator根据配置生成音效
4. **实时更新**: 配置修改后实时反映到功能页面

### 核心类型定义

#### GridCell (网格单元格)
```typescript
interface GridCell {
  id: string;                    // 唯一标识
  row: number;                   // 行位置
  col: number;                   // 列位置
  key: string;                   // 键盘快捷键
  soundType: 'piano' | 'drum' | 'synth';  // 音效类型
  waveType: 'sine' | 'square' | 'sawtooth' | 'triangle';  // 波形类型
  frequency?: number;            // 频率
  volume?: number;               // 音量(百分比)
  description: string;           // 描述
  icon: string;                  // 图标
  color: string;                 // 颜色
  enabled: boolean;              // 是否启用
}
```

#### GridConfig (网格配置)
```typescript
interface GridConfig {
  id: string;                    // 配置ID
  name: string;                  // 配置名称
  description: string;           // 配置描述
  rows: number;                  // 行数
  cols: number;                  // 列数
  cells: GridCell[];             // 单元格数组
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

## 最新改进 (v1.1.0)

### 1. 配置数据联通
- ✅ SimpleMikutapPage现在完全使用配置化的网格布局
- ✅ 音频生成器支持基于单元格配置的音效播放
- ✅ 实时反映配置修改，无需重启

### 2. 音频系统增强
- ✅ 新增`playSoundByCell`方法，支持基于配置的音效播放
- ✅ 根据音效类型自动调整音效持续时间
- ✅ 支持单元格级别的音量控制

### 3. 用户体验优化
- ✅ 网格帮助信息动态显示实际配置
- ✅ 鼠标位置指示器显示准确的单元格信息
- ✅ 添加配置按钮，快速跳转到配置页面
- ✅ 底部音效类型标识动态生成

### 4. 代码质量提升
- ✅ 修复所有TypeScript linter错误
- ✅ 改进错误处理和边界情况
- ✅ 优化代码结构和可维护性

## 配置存储

### 存储位置
- 使用localStorage存储用户配置
- 存储键: `mikutap-grid-config`

### 默认配置
- 网格尺寸: 5列 × 6行
- 音效分布: 前10个为钢琴音，中9个为鼓点音，后7个为特效音
- 支持26个字母键的映射

## 页面路由

### 功能页面
- 路径: `/testField/mikutap`
- 组件: `SimpleMikutapPage`
- 功能: 音乐演奏和互动

### 配置页面
- 路径: `/testField/mikutap/config`
- 组件: `ConfigPage`
- 功能: 网格配置和音效设置

## 快捷键

### 全局快捷键
- `ESC`: 关闭所有弹窗和帮助
- `F1` / `Ctrl+H`: 切换帮助信息显示
- `Ctrl+S`: 打开设置面板

### 演奏快捷键
- `A-Z`: 对应网格单元格的音效演奏
- 鼠标点击/拖拽: 位置相关的音效演奏
- 触摸操作: 移动设备优化的触摸演奏

## 浏览器兼容性

### 支持的浏览器
- Chrome 66+
- Firefox 60+
- Safari 11.1+
- Edge 79+

### 音频API要求
- Web Audio API支持
- 用户手势激活音频上下文(现代浏览器安全要求)

## 开发指南

### 本地开发
```bash
# 启动开发服务器
pnpm dev

# 访问功能页面
http://localhost:3000/testField/mikutap

# 访问配置页面
http://localhost:3000/testField/mikutap/config
```

### 构建生产版本
```bash
pnpm build
```

### 代码风格
- 使用TypeScript严格模式
- 遵循React Hooks最佳实践
- 使用Tailwind CSS进行样式管理

## 数据库持久化 (v1.2.0 新增)

### 数据库表结构

#### mikutap_configs (配置表)
- `id` - 配置唯一标识
- `name` - 配置名称  
- `description` - 配置描述
- `rows`, `cols` - 网格尺寸
- `sound_library` - 音效库配置 (JSON)
- `created_at`, `updated_at` - 时间戳

#### mikutap_grid_cells (网格单元格表)
- `id` - 单元格唯一标识
- `config_id` - 关联配置ID
- `row`, `col` - 网格位置
- `key` - 绑定按键
- `sound_type` - 音效类型
- `sound_source` - 音效来源
- `wave_type` - 波形类型
- `frequency`, `volume` - 音效参数
- `description`, `icon`, `color` - 显示属性
- `enabled` - 启用状态
- `audio_file` - 音频文件路径
- `effects` - 音效处理参数 (JSON)

#### mikutap_sound_library (音效库表)  
- `id` - 音效唯一标识
- `config_id` - 关联配置ID
- `name` - 音效名称
- `file` - 文件路径
- `type` - 音效类型
- `description` - 描述
- `size`, `duration` - 文件属性

### API接口

#### 配置管理 (/api/mikutap/configs)
- `GET` - 获取配置列表或单个配置
- `POST` - 创建新配置
- `PUT` - 更新配置
- `DELETE` - 删除配置

#### 音效库管理 (/api/mikutap/sound-library)
- `GET` - 获取音效库列表
- `POST` - 添加音效项目
- `PUT` - 更新音效项目
- `DELETE` - 删除音效项目

### 新增功能特性

1. **双重存储机制**
   - 同时支持本地存储和数据库存储
   - 数据库连接失败时自动回退到本地存储
   - 数据同步和一致性保证

2. **数据库操作Hook**
   - `useConfigDatabase` - 封装了完整的CRUD操作
   - 自动加载状态和错误处理
   - TypeScript类型安全

3. **配置页面增强**
   - 集成数据库保存功能
   - 智能错误处理和用户提示
   - 配置存储方式切换

### 数据库迁移

生成新的迁移文件：
```bash
pnpm devdb:generate
```

应用迁移到开发环境：
```bash
pnpm devdb:push
```

应用迁移到生产环境：
```bash
pnpm prodb:push
```

## 未来计划

### 短期目标
- [ ] 音效预设模板
- [ ] 配置导入/导出功能
- [ ] 音效录制功能
- [x] 数据库持久化系统 ✅
- [ ] 多配置管理界面
- [ ] 配置分享功能

### 中期目标
- [ ] 配置版本控制
- [ ] 用户权限管理
- [ ] 云端配置同步
- [ ] 高级音效处理

### 长期目标
- [ ] 多人协作演奏
- [ ] 音效可视化增强
- [ ] MIDI设备支持
- [ ] 音乐序列录制和回放

## 贡献指南

1. 遵循现有代码风格
2. 确保所有TypeScript类型正确
3. 添加适当的错误处理
4. 更新相关文档
5. 测试移动端兼容性

## 问题反馈

如遇到问题或有改进建议，请在项目仓库中创建issue。 