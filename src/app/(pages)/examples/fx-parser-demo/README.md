# FX文件解析器演示页面

这是一个完整的FX文件解析器演示应用，展示了如何使用 `sa2kit/mmd/fx` 模块解析MME效果文件。

## 📍 访问地址

开发服务器启动后访问：
```
http://localhost:3000/fx-parser-demo
```

## 🎯 功能演示

### 1. 文件上传模式
- 支持拖拽上传 `.fx` 文件
- 自动解析并显示结果
- 快速示例按钮（需要配置示例文件）

### 2. 文本粘贴模式
- 直接粘贴FX文件内容
- 实时解析和预览
- 自定义文件名

### 3. 可视化展示
- **摘要标签**: 统计信息、功能特性、控制器等
- **宏定义标签**: 所有 #define 指令，包括启用/禁用状态
- **纹理标签**: 纹理路径、尺寸、用途分类
- **参数标签**: 所有参数声明及其类型和默认值
- **验证标签**: 完整性验证和错误/警告提示

### 4. 导出功能
- **JSON导出**: 机器可读格式，适合程序处理
- **Markdown导出**: 人类可读文档，适合查看和分享

## 🔧 技术实现

### 使用的组件和工具

```typescript
import { 
  FXParser,           // 核心解析器
  FXViewer,           // React可视化组件
  exportFXToJSON,     // JSON导出工具
  exportFXToMarkdown  // Markdown导出工具
} from 'sa2kit/mmd/fx';
```

### 核心代码示例

```typescript
// 解析文件
const parser = new FXParser();
const effect = await parser.loadAndParse('/path/to/effect.fx');

// 或从文本内容解析
const effect = parser.parse(fxContent, 'effect.fx');

// 使用可视化组件
<FXViewer
  source={fxContent}
  isContent={true}
  fileName={fileName}
  onParsed={(effect) => console.log('解析完成:', effect)}
/>
```

## 📁 文件结构

```
fx-parser-demo/
├── page.tsx          # 主页面组件
├── FXViewer.css      # 样式文件（从源码复制）
└── README.md         # 本文件
```

## 🎨 示例文件

页面包含快速示例按钮，但需要在 `public/examples/` 目录下放置示例文件：

```
public/examples/
├── PAToon_shader.fx
└── PAToon_model.fx
```

如果没有示例文件，可以：
1. 使用文件上传功能
2. 使用文本粘贴功能
3. 从 `/Users/qihongrui/Downloads/PAToon/` 复制测试文件

## 📊 已测试的文件

以下文件已成功解析：

### PAToon_シェーダー_標準.fx
- 65个宏定义
- 8个参数
- 4个纹理
- LocalShadow, ExcellentShadow, HgShadow 等功能

### PAToon_モデル_標準.fx
- 65个宏定义（+ModelToon）
- 8个参数
- 4个纹理
- 所有Shader功能 + ModelToon

## 🚀 本地开发

```bash
# 启动开发服务器
cd /Users/qihongrui/Desktop/sa2kit/examples
npm run dev

# 访问页面
open http://localhost:3000/fx-parser-demo
```

## 💡 使用技巧

1. **快速测试**: 使用文本粘贴模式，直接粘贴FX代码片段
2. **批量分析**: 上传多个文件，对比解析结果
3. **导出备份**: 使用JSON导出保存解析结果
4. **文档生成**: 使用Markdown导出创建可读文档

## 🔗 相关资源

- **完整文档**: `/src/mmd/fx/README.md`
- **使用指南**: `/src/mmd/fx/USAGE.md`
- **测试脚本**: `/src/mmd/fx/test-patoon.ts`
- **类型定义**: `/src/mmd/fx/types.ts`

## 🎯 下一步

- 添加更多示例文件到 `public/examples/`
- 创建效果预设库
- 实现参数可视化编辑器
- 集成到MMD播放器中






