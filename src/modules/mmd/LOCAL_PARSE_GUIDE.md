# MMD模块 - 本地文件解析指南

## 概述

本指南介绍如何使用修改后的MMD模块进行本地文件解析，不依赖服务器上传功能。

## 修改内容

### 1. 注释掉的服务器上传功能

- **`UniversalFileUploader`组件**: 注释了服务器上传逻辑，现在只处理本地文件
- **API端点**: 保留但不再使用 `/api/mmd/upload/models` 等上传端点
- **文件处理**: 改为前端直接处理，返回File对象和ArrayBuffer

### 2. 新增的本地处理流程

```
用户选择文件 → UniversalFileUploader处理 → 生成本地URL和文件数据 → 
MMDViewerPage接收 → 传递给MMDViewer → 直接解析显示
```

### 3. 核心修改文件

- `src/components/UniversalFileUploader/UniversalFileUploader.tsx`
- `src/modules/mmd/pages/MMDViewerPage.tsx`
- `src/modules/mmd/components/MMDViewer/MMDViewer.tsx`
- `src/modules/mmd/types/index.ts`
- `src/modules/mmd/utils/parseMMDFile.ts` (新增)

## 使用方法

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 访问MMD查看器

```
http://localhost:3000/testField/mmdViewer
```

### 3. 导入本地文件

1. 点击 "导入模型" 按钮
2. 选择本地的 `.pmd` 或 `.pmx` 文件
3. 文件将自动解析并显示在查看器中

## 技术细节

### 本地文件数据流

```typescript
// 1. UniversalFileUploader处理文件
const result = {
  file: File,              // 原始File对象
  localUrl: string,        // blob:// URL
  name: string,
  size: number,
  type: string
};

// 2. MMDViewerPage转换数据
const localFileData = {
  file: File,
  arrayBuffer: ArrayBuffer,
  name: string
};

// 3. MMDViewer接收并解析
loadModelFromBuffer(arrayBuffer, fileName);
```

### 核心API

- `parseMMDFile(file: File)`: 解析MMD文件的工具函数
- `loadModelFromBuffer(arrayBuffer: ArrayBuffer, fileName: string)`: MMDViewer的本地解析方法
- `localFileData` prop: 传递本地文件数据给MMDViewer

## 优势

1. **无需服务器**: 完全在前端处理，不需要文件上传
2. **快速响应**: 直接解析，无网络延迟
3. **隐私保护**: 文件不离开用户设备
4. **简化流程**: 减少了服务器端的复杂性

## 注意事项

1. **内存使用**: 大文件会占用更多浏览器内存
2. **文件大小限制**: 建议单个文件不超过100MB
3. **支持格式**: 仅支持 `.pmd` 和 `.pmx` 格式
4. **临时URL**: 使用 `URL.createObjectURL()` 创建的临时URL需要手动清理

## 恢复服务器上传功能

如需恢复服务器上传功能，只需：

1. 取消注释 `UniversalFileUploader.tsx` 中的服务器上传代码
2. 恢复 `uploadEndpoint` 配置
3. 修改 `handleImportSuccess` 处理逻辑

## 调试信息

开发模式下，控制台会显示详细的解析日志：
- 文件选择信息
- 解析进度
- 模型详细信息
- 错误信息

检查浏览器控制台获取更多调试信息。 