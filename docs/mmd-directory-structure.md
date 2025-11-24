# MMD 资源目录结构说明

## 📁 问题描述

之前上传的 MMD 模型无法正确显示贴图，原因是文件被上传到了扁平的目录结构中，丢失了原始的子目录（如 `texture/`）。

### 问题示例

**错误的目录结构**（之前）：
```
mmd/2025/11/24/
├── model.pmx
├── face.png      ❌ 贴图在根目录
├── body.png      ❌ 贴图在根目录
├── motion.vmd
└── audio.wav
```

PMX 文件中的贴图引用路径是相对路径，例如：
- `texture/face.png`
- `texture/body.png`

但文件被放在了根目录，导致模型找不到贴图。

## ✅ 解决方案

### 正确的目录结构

```
mmd/2025/11/24/model-name/
├── model.pmx
├── texture/               ✅ 保持子目录
│   ├── face.png
│   └── body.png
├── motion.vmd
└── audio.wav
```

### 实现原理

#### 1. 使用 `customPath` 参数

`UploadFileInfo` 接口已经支持 `customPath` 字段：

```typescript
export interface UploadFileInfo {
  file: File;
  moduleId: string;
  businessId?: string;
  customPath?: string;  // ✅ 自定义存储路径
  // ... 其他字段
}
```

#### 2. `UniversalFileService.uploadFile` 优先使用自定义路径

```typescript
// 生成存储路径（优先使用自定义路径）
const storagePath = fileInfo.customPath || this.generateStoragePath(metadata);
```

#### 3. `upload-mmd-zip` API 传递完整路径

```typescript
for (const { entry, relativePath } of allFiles) {
  const fileBuffer = entry.getData();
  const fileName = path.basename(relativePath);
  const fileDir = path.dirname(relativePath);
  
  // 构建完整的存储路径，保持原始目录结构
  const storagePath = fileDir && fileDir !== '.'
    ? `${basePath}/${fileDir}/${fileName}`  // ✅ 保持子目录
    : `${basePath}/${fileName}`;

  // 上传时传递 customPath
  const result = await fileService.uploadFile({
    file: uploadFile,
    moduleId: 'mmd',
    businessId: 'resources',
    permission: 'public',
    needsProcessing: false,
    customPath: storagePath,  // ✅ 使用完整路径
  });
}
```

## 📊 路径映射示例

### 压缩包内部结构

```
miku-model.zip
├── miku.pmx
├── texture/
│   ├── face.png
│   ├── body.png
│   └── hair.png
├── motion/
│   └── dance.vmd
└── audio/
    └── song.wav
```

### 上传后的 OSS 结构

```
mmd/2025/11/24/miku-model/
├── miku.pmx
├── texture/
│   ├── face.png
│   ├── body.png
│   └── hair.png
├── motion/
│   └── dance.vmd
└── audio/
    └── song.wav
```

### relativePath → storagePath 映射

| 压缩包中的路径 | relativePath | storagePath |
|---------------|--------------|-------------|
| `miku.pmx` | `miku.pmx` | `mmd/2025/11/24/miku-model/miku.pmx` |
| `texture/face.png` | `texture/face.png` | `mmd/2025/11/24/miku-model/texture/face.png` |
| `texture/body.png` | `texture/body.png` | `mmd/2025/11/24/miku-model/texture/body.png` |
| `motion/dance.vmd` | `motion/dance.vmd` | `mmd/2025/11/24/miku-model/motion/dance.vmd` |
| `audio/song.wav` | `audio/song.wav` | `mmd/2025/11/24/miku-model/audio/song.wav` |

## 🔍 调试日志

上传时会输出详细的路径映射信息：

```
📤 上传 [1/10]: {
  原始路径: 'texture/face.png',
  存储路径: 'mmd/2025/11/24/miku-model/texture/face.png',
  文件夹: 'texture',
  文件名: 'face.png'
}
```

## ✅ 验证方法

### 1. 检查上传日志

观察服务器输出，确认 `存储路径` 包含了子目录：

```bash
# 正确的输出
📤 上传 [3/10]: {
  原始路径: 'texture/face.png',
  存储路径: 'mmd/2025/11/24/model-name/texture/face.png',  ✅
  文件夹: 'texture',  ✅
  文件名: 'face.png'
}
```

### 2. 检查 OSS 存储

在 OSS 控制台或使用 API 查询文件列表：

```bash
npx tsx scripts/check-oss-files.ts
```

应该看到类似的结构：
```
📁 mmd/2025/11/24/model-name/
  📄 model.pmx
  📁 texture/
    📄 face.png
    📄 body.png
  📄 motion.vmd
  📄 audio.wav
```

### 3. 测试模型加载

在 MMD 播放器中加载模型，检查贴图是否正确显示：

```typescript
<MMDPlayerEnhanced
  resources={{
    modelPath: 'https://oss-url/mmd/2025/11/24/model-name/model.pmx',
    // PMX 文件会自动解析 texture/ 子目录中的贴图
  }}
/>
```

## 🎯 PMX 文件中的相对路径

MMD 模型文件（.pmx）内部存储的是**相对路径**：

```
# PMX 文件中的贴图引用
texture/face.png
texture/body.png
texture/hair.png
```

这些路径是**相对于 .pmx 文件所在目录**的。因此，文件结构必须保持：

```
model.pmx 所在目录/
├── model.pmx          ← PMX 文件位置
└── texture/           ← 贴图相对于 PMX 的位置
    ├── face.png
    └── body.png
```

## ⚠️ 常见问题

### 问题 1：模型显示为纯白色

**原因**：贴图文件找不到，可能是目录结构不对

**解决**：
1. 检查上传日志，确认 `texture/` 子目录被保留
2. 检查 OSS 中的文件结构
3. 确认 PMX 文件和贴图在同一个 basePath 下

### 问题 2：某些贴图显示，某些不显示

**原因**：部分贴图路径不一致

**解决**：
1. 检查 PMX 文件中引用的路径（使用 PMX Editor）
2. 确保所有引用的贴图都被上传
3. 检查文件名大小写（OSS 是大小写敏感的）

### 问题 3：本地可以显示，OSS 上不行

**原因**：可能是 CORS 或路径编码问题

**解决**：
1. 检查 OSS CORS 配置
2. 检查文件名是否包含特殊字符
3. 使用 CDN URL 而非直接 OSS URL

## 📚 相关文档

- [MMD 资源上传指南](./mmd-resource-upload-guide.md)
- [OSS 路径格式说明](./mmd-oss-path-guide.md)
- [MMD Zip 上传指南](./mmd-zip-upload-guide.md)

## 🔗 相关代码

- `src/services/universalFile/UniversalFileService.ts` - 文件上传服务
- `src/app/api/upload-mmd-zip/route.ts` - MMD Zip 上传 API
- `src/services/universalFile/types/index.ts` - `UploadFileInfo` 接口定义

