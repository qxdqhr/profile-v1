# MMD 资源上传完整指南

## 🎯 为什么模型显示不正常？

### 常见问题

如果你上传 MMD 模型后发现：
- 模型是黑色的
- 模型是透明的
- 模型没有纹理
- 模型显示不完整

**原因：** 你可能只上传了模型文件（.pmx/.pmd），而没有上传配套的贴图文件。

### MMD 模型的文件结构

一个完整的 MMD 模型通常包含：

```
miku/                          # 模型文件夹
├── miku.pmx                   # 模型主文件
├── textures/                  # 贴图文件夹
│   ├── face.png              # 脸部贴图
│   ├── body.png              # 身体贴图
│   ├── hair.png              # 头发贴图
│   ├── eye.png               # 眼睛贴图
│   └── ...                   # 其他贴图
├── toon/                      # 卡通渲染贴图（可选）
│   └── toon01.bmp
└── materials/                 # 材质文件（可选）
    └── ...
```

**重要：** .pmx 文件内部使用**相对路径**引用贴图文件，例如：
```
textures/face.png
textures/body.png
```

## ✅ 正确的上传方式

### 方法一：上传整个文件夹（推荐）

1. **准备模型文件夹**
   ```
   确保文件夹包含：
   - 模型文件 (.pmx 或 .pmd)
   - 所有贴图文件 (.png, .jpg, .bmp, .tga 等)
   - 保持原始的文件夹结构
   ```

2. **上传到 OSS**
   - 访问 `/testField/mmdUpload`
   - 点击上传区域
   - 选择**整个模型文件夹**（不是单个文件）
   - 等待所有文件上传完成

3. **记录基础路径**
   ```
   上传后会得到类似的路径：
   https://your-bucket.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/miku.pmx
   
   基础路径就是：
   https://your-bucket.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/
   ```

4. **在 MMD 播放器中使用**
   ```typescript
   const resources = {
     modelPath: 'https://your-bucket.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/miku.pmx',
     // 贴图会自动从相对路径加载：
     // https://your-bucket.oss-cn-beijing.aliyuncs.com/mmd/2025/11/23/miku/textures/face.png
   };
   ```

### 方法二：手动上传所有文件

如果无法上传文件夹，可以手动上传所有文件：

1. **列出所有需要的文件**
   - 打开模型文件夹
   - 找到所有 .png, .jpg, .bmp, .tga, .spa, .sph 等贴图文件
   - 记录它们的相对路径

2. **批量上传**
   - 选择所有文件（包括模型和贴图）
   - 一次性上传
   - 确保文件路径结构保持一致

3. **验证上传**
   - 检查每个贴图文件是否都上传成功
   - 确认路径结构正确

## 📋 支持的贴图格式

MMD 模型常用的贴图格式：

| 格式 | 用途 | 说明 |
|------|------|------|
| .png | 通用贴图 | 最常用，支持透明通道 |
| .jpg | 通用贴图 | 文件较小，不支持透明 |
| .bmp | 通用贴图 | 较大，但兼容性好 |
| .tga | 高质量贴图 | 支持透明通道 |
| .spa | 球形贴图 | 用于环境反射 |
| .sph | 球形贴图 | 用于环境反射 |

## 🔍 如何检查模型需要哪些贴图？

### 方法一：查看模型文件夹

直接查看模型文件夹中的文件：
```bash
miku/
├── miku.pmx
└── textures/
    ├── face.png      # 需要上传
    ├── body.png      # 需要上传
    └── hair.png      # 需要上传
```

### 方法二：使用 PMX Editor（Windows）

1. 下载 PMX Editor
2. 打开模型文件
3. 查看「材质」标签
4. 记录所有引用的贴图路径

### 方法三：查看浏览器控制台

1. 上传模型后加载
2. 打开浏览器开发者工具（F12）
3. 查看 Console 标签
4. 找到类似的错误信息：
   ```
   Failed to load texture: textures/face.png
   404 Not Found
   ```
5. 这些就是缺失的贴图文件

## 🎨 实际案例

### 案例 1：初音未来模型

**文件结构：**
```
YYB_Z6SakuraMiku/
├── miku.pmx
├── miku.spa
├── miku.sph
└── textures/
    ├── face00.png
    ├── body00.png
    ├── hair00.png
    ├── eye00.png
    └── ...
```

**上传步骤：**
1. 选择整个 `YYB_Z6SakuraMiku` 文件夹
2. 上传到 OSS
3. 得到路径：`https://xxx.oss.com/mmd/2025/11/23/YYB_Z6SakuraMiku/miku.pmx`
4. 贴图自动从 `https://xxx.oss.com/mmd/2025/11/23/YYB_Z6SakuraMiku/textures/` 加载

### 案例 2：艾尔莎模型

**文件结构：**
```
elsa/
├── 艾尔莎-水手服泳装.pmx
└── tex/
    ├── 01.png
    ├── 02.png
    └── 03.png
```

**上传步骤：**
1. 选择整个 `elsa` 文件夹
2. 上传到 OSS
3. 得到路径：`https://xxx.oss.com/mmd/2025/11/23/elsa/艾尔莎-水手服泳装.pmx`
4. 贴图自动从 `https://xxx.oss.com/mmd/2025/11/23/elsa/tex/` 加载

## ⚠️ 常见错误

### 错误 1：只上传了 .pmx 文件

```
❌ 错误做法：
只上传 miku.pmx

✅ 正确做法：
上传整个 miku 文件夹（包含所有贴图）
```

### 错误 2：贴图路径不匹配

```
❌ 错误：
模型路径：https://xxx.oss.com/models/miku.pmx
贴图路径：https://xxx.oss.com/textures/face.png

模型会尝试加载：
https://xxx.oss.com/models/textures/face.png ❌ 404

✅ 正确：
模型路径：https://xxx.oss.com/models/miku/miku.pmx
贴图路径：https://xxx.oss.com/models/miku/textures/face.png
```

### 错误 3：文件名大小写不匹配

```
❌ 模型引用：textures/Face.png
   实际文件：textures/face.png
   （Linux/OSS 区分大小写）

✅ 确保文件名大小写完全一致
```

## 🚀 优化建议

### 1. 使用 CDN 加速

配置 CDN 域名后，贴图加载速度会更快：
```
原始：https://bucket.oss-cn-beijing.aliyuncs.com/mmd/miku/textures/face.png
CDN： https://cdn.yourdomain.com/mmd/miku/textures/face.png
```

### 2. 压缩贴图文件

- 使用工具压缩 PNG 文件（如 TinyPNG）
- 将大尺寸贴图缩小到合理大小
- 考虑使用 WebP 格式（需要转换工具）

### 3. 批量上传

如果有多个模型：
```
mmd/
├── miku/
│   ├── miku.pmx
│   └── textures/
├── elsa/
│   ├── elsa.pmx
│   └── tex/
└── luka/
    ├── luka.pmx
    └── images/
```

一次性上传整个 `mmd` 文件夹。

## 📞 故障排查

### 问题：模型显示为黑色

**可能原因：**
1. 贴图文件未上传
2. 贴图路径不正确
3. CORS 配置问题

**解决方法：**
1. 检查浏览器控制台的 404 错误
2. 确认所有贴图文件都已上传
3. 验证 OSS CORS 配置

### 问题：部分贴图显示，部分不显示

**可能原因：**
1. 某些贴图文件未上传
2. 文件名大小写不匹配

**解决方法：**
1. 查看控制台找出缺失的文件
2. 补充上传缺失的贴图
3. 检查文件名大小写

### 问题：本地可以显示，OSS 不能显示

**可能原因：**
1. 本地路径和 OSS 路径结构不同
2. CORS 未配置

**解决方法：**
1. 保持相同的文件夹结构
2. 配置 OSS CORS（参考 `docs/oss-cors-setup.md`）

## 💡 最佳实践

1. **始终上传完整的模型文件夹**
   - 不要只上传 .pmx 文件
   - 包含所有依赖的贴图和资源

2. **保持文件夹结构**
   - 不要改变贴图的相对路径
   - 保持原始的文件夹层级

3. **使用英文路径**
   - 避免中文文件名和路径
   - 使用小写字母和连字符

4. **测试后再使用**
   - 上传后先在测试页面验证
   - 确认模型显示正常后再用于生产

5. **记录资源清单**
   - 记录每个模型的完整路径
   - 记录依赖的贴图文件列表

## 📚 相关文档

- [OSS CORS 配置指南](./oss-cors-setup.md)
- [MMD 上传工具使用指南](./mmd-upload-guide.md)
- [SA2Kit MMD 组件文档](./sa2kit-mmd-setup.md)

## 🆘 需要帮助？

如果按照本指南操作后仍有问题：
1. 检查浏览器控制台的完整错误信息
2. 确认 OSS CORS 配置正确
3. 验证所有文件都已成功上传
4. 查看文件路径是否正确

