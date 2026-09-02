# MMD模块简单使用指南

这是MMD模块的核心功能使用方法，专注于本地文件导入和模型显示。

## 核心功能

1. 本地导入PMD/PMX文件
2. 解析MMD模型数据
3. 在3D场景中显示模型

## 基础使用

### 1. 导入MMD查看器组件

```typescript
import { MMDViewer, parseMMDFile, MMDModelBuilder } from '@/modules/mmd';
```

### 2. 使用MMDViewer组件

```tsx
function MyMMDApp() {
  const [currentModel, setCurrentModel] = useState(null);

  return (
    <div>
      <MMDViewer 
        width="800px" 
        height="600px"
        controls={true}
        onLoad={(model) => console.log('模型加载完成:', model)}
        onError={(error) => console.error('加载失败:', error)}
      />
    </div>
  );
}
```

### 3. 直接解析MMD文件

```typescript
// 方法1：使用内置解析函数
async function handleFileUpload(file: File) {
  try {
    const mmdModel = await parseMMDFile(file);
    console.log('解析成功:', {
      name: mmdModel.metadata.modelName,
      vertices: mmdModel.vertices.length,
      faces: mmdModel.faces.length
    });
  } catch (error) {
    console.error('解析失败:', error);
  }
}

// 方法2：直接使用MMDParser
import { MMDParser } from 'mmd-parser';

async function parseFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  
  if (file.name.endsWith('.pmx')) {
    return MMDParser.parsePmx(arrayBuffer);
  } else if (file.name.endsWith('.pmd')) {
    return MMDParser.parsePmd(arrayBuffer);
  }
}
```

### 4. 构建Three.js模型

```typescript
import { MMDModelBuilder } from '@/modules/mmd';

// 将解析的MMD数据转换为Three.js对象
const mmdModel = await parseMMDFile(file);
const threeGroup = MMDModelBuilder.buildMesh(mmdModel);

// 添加到Three.js场景
scene.add(threeGroup);
```

## 完整示例

```tsx
import React, { useRef } from 'react';
import { MMDViewer, parseMMDFile, MMDModelBuilder } from '@/modules/mmd';

function SimpleMMDViewer() {
  const viewerRef = useRef<any>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 解析MMD文件
      const mmdModel = await parseMMDFile(file);
      
      // 构建Three.js模型
      const threeModel = MMDModelBuilder.buildMesh(mmdModel);
      
      console.log('模型加载成功:', {
        name: mmdModel.metadata.modelName,
        vertices: mmdModel.vertices.length
      });
      
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-100">
        <input 
          type="file" 
          accept=".pmd,.pmx"
          onChange={handleFileSelect}
          className="mb-4"
        />
      </div>
      
      <div className="flex-1">
        <MMDViewer 
          ref={viewerRef}
          width="100%" 
          height="100%"
          controls={true}
          onLoad={(model) => console.log('查看器加载完成')}
          onError={(error) => console.error('查看器错误:', error)}
        />
      </div>
    </div>
  );
}

export default SimpleMMDViewer;
```

## 支持的文件格式

- **PMX** - MikuMikuDance的新格式，推荐使用
- **PMD** - MikuMikuDance的传统格式

## 常见问题

### Q: 解析失败怎么办？
A: 检查文件是否为标准的PMD/PMX格式，确认文件没有损坏。

### Q: 模型显示异常？  
A: 某些复杂的材质和纹理可能显示不正确，这是简化版本的限制。

### Q: 如何添加动画？
A: 当前版本专注于模型显示，VMD动画支持在后续版本中实现。

## 技术栈

- **Three.js** - 3D渲染引擎
- **mmd-parser** - MMD文件解析库
- **React** - UI框架
- **TypeScript** - 类型安全 