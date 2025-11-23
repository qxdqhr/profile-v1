# MMD 资源上传工具使用指南

## 📖 简介

MMD 资源上传工具是一个专门用于上传 MMD（MikuMikuDance）相关资源到阿里云 OSS 的工具页面。通过将资源上传到 OSS 并使用 CDN 加速，可以显著提升 MMD 资源的加载速度，改善用户体验。

## 🚀 功能特性

- ✅ **拖拽上传** - 支持拖拽文件到上传区域
- ✅ **批量上传** - 可同时上传多个文件（最多 20 个）
- ✅ **大文件支持** - 单个文件最大支持 500MB
- ✅ **进度显示** - 实时显示上传进度和状态
- ✅ **CDN 加速** - 自动生成 CDN 加速链接
- ✅ **URL 复制** - 一键复制原始 URL 或 CDN URL
- ✅ **文件类型识别** - 自动识别并标注文件类型

## 📂 支持的文件类型

### MMD 模型文件
- `.pmx` - PMX 模型文件
- `.pmd` - PMD 模型文件

### 动作文件
- `.vmd` - VMD 动作/相机文件

### 音频文件
- `.wav` - WAV 音频
- `.mp3` - MP3 音频
- `.ogg` - OGG 音频

### 图片文件（贴图/背景）
- `.jpg` / `.jpeg` - JPEG 图片
- `.png` - PNG 图片
- `.webp` - WebP 图片

### 视频文件
- `.mp4` - MP4 视频
- `.webm` - WebM 视频

## 🔧 使用前准备

### 1. 配置 OSS

在使用上传工具前，需要先配置阿里云 OSS。有两种配置方式：

#### 方式一：通过配置管理页面（推荐）

1. 访问配置管理页面：`/testField/configManagement`
2. 找到「阿里云 OSS 配置」部分
3. 填写以下信息：
   - Region（地域）：如 `oss-cn-hangzhou`
   - Bucket（存储桶名称）
   - Access Key ID
   - Access Key Secret
4. 点击保存

#### 方式二：通过环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
# 阿里云 OSS 配置
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_BUCKET=your-bucket-name
ALIYUN_OSS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_OSS_ACCESS_KEY_SECRET=your-access-key-secret

# 可选：CDN 配置
ALIYUN_CDN_DOMAIN=your-cdn-domain.com
ALIYUN_CDN_ACCESS_KEY_ID=your-cdn-access-key-id
ALIYUN_CDN_ACCESS_KEY_SECRET=your-cdn-access-key-secret
```

### 2. 重启开发服务器

配置完成后，重启开发服务器使配置生效：

```bash
pnpm dev
```

## 📝 使用步骤

### 1. 访问上传页面

访问：`http://localhost:3001/testField/mmdUpload`

### 2. 上传文件

有两种上传方式：

#### 方式一：拖拽上传
1. 将文件拖拽到上传区域
2. 松开鼠标，文件自动开始上传

#### 方式二：点击上传
1. 点击上传区域
2. 在文件选择对话框中选择文件
3. 点击「打开」，文件自动开始上传

### 3. 查看上传进度

上传过程中会显示：
- 文件名
- 上传进度百分比
- 上传速度
- 剩余时间

### 4. 获取 URL

上传成功后，在「已上传文件」列表中可以看到：

- **原始 URL**：OSS 直接访问地址
- **CDN URL**（推荐）：CDN 加速地址，加载速度更快

点击「复制」按钮即可复制 URL 到剪贴板。

### 5. 在 MMD 播放器中使用

将复制的 CDN URL 用于 MMD 播放器配置：

```typescript
const resources = {
  modelPath: 'https://your-cdn-domain.com/mmd/models/miku.pmx',
  motionPath: 'https://your-cdn-domain.com/mmd/motions/dance.vmd',
  audioPath: 'https://your-cdn-domain.com/mmd/audio/music.mp3',
  cameraPath: 'https://your-cdn-domain.com/mmd/camera/camera.vmd',
};
```

## 🎯 最佳实践

### 1. 文件组织

建议按照以下结构组织 MMD 资源：

```
mmd/
├── models/          # 模型文件
│   ├── miku/
│   │   ├── miku.pmx
│   │   └── textures/
│   └── elsa/
│       └── elsa.pmx
├── motions/         # 动作文件
│   ├── dance.vmd
│   └── wave.vmd
├── audio/           # 音频文件
│   └── music.mp3
├── camera/          # 相机文件
│   └── camera.vmd
└── backgrounds/     # 背景图片
    └── stage.jpg
```

### 2. 批量上传

对于同一个 MMD 作品的所有资源，可以一次性选择所有文件进行批量上传，提高效率。

### 3. 使用 CDN URL

生产环境中，始终使用 CDN URL 而不是原始 URL，以获得最佳的加载速度和用户体验。

### 4. 文件命名

- 使用英文命名，避免中文和特殊字符
- 使用有意义的名称，如 `miku-dance.vmd` 而不是 `motion1.vmd`
- 保持文件名简洁，避免过长

## 🔍 故障排查

### 问题 1：初始化失败

**错误信息**：「初始化失败」或「OSS 配置无效」

**解决方法**：
1. 检查 OSS 配置是否正确
2. 确认 Access Key 权限是否足够
3. 检查网络连接
4. 查看浏览器控制台的详细错误信息

### 问题 2：上传失败

**错误信息**：「文件上传失败」

**可能原因**：
1. 文件大小超过限制（500MB）
2. 文件类型不支持
3. OSS 存储空间不足
4. 网络连接中断

**解决方法**：
1. 检查文件大小和类型
2. 确认 OSS 存储空间充足
3. 重试上传
4. 检查网络连接

### 问题 3：无法访问上传的文件

**错误信息**：访问 URL 时返回 403 或 404

**解决方法**：
1. 检查 OSS Bucket 的访问权限设置
2. 确认文件确实上传成功
3. 检查 URL 是否正确
4. 确认 CDN 配置是否正确

## 📊 性能对比

### 本地加载 vs OSS+CDN

| 指标 | 本地加载 | OSS+CDN |
|------|---------|---------|
| 初次加载速度 | 慢 | 快 |
| 全球访问速度 | 受服务器位置影响大 | 全球加速 |
| 服务器带宽压力 | 高 | 低 |
| 缓存效果 | 一般 | 优秀 |
| 成本 | 服务器带宽成本 | OSS+CDN 成本 |

### 实测数据（示例）

以一个 50MB 的 MMD 模型为例：

- **本地加载**：首次加载 15-30 秒
- **OSS 直连**：首次加载 8-15 秒
- **OSS+CDN**：首次加载 3-8 秒

*注：实际速度取决于网络环境和文件大小*

## 🔗 相关链接

- [MMD 功能测试页面](/testField/mmdTest)
- [MMD 播放列表页面](/testField/mmdPlaylist)
- [配置管理页面](/testField/configManagement)
- [SA2Kit MMD 文档](../docs/sa2kit-mmd-setup.md)

## 💡 提示

1. 首次使用前，请确保已正确配置 OSS
2. 上传大文件时，请保持网络连接稳定
3. 建议使用 CDN URL 以获得最佳性能
4. 定期清理不再使用的文件，节省存储空间
5. 可以在配置管理页面查看和管理已上传的文件

## 📞 技术支持

如遇到问题，请：
1. 查看浏览器控制台的错误信息
2. 检查 OSS 配置是否正确
3. 参考本文档的故障排查部分
4. 联系技术支持团队

