# ShowMasterPieces 配置管理系统

## 概述

ShowMasterPieces 配置管理系统是一个完整的后台管理界面，允许用户通过可视化界面配置和管理画集展览的所有数据，包括基础配置、画集管理和作品管理。

## 功能特性

### 🎛️ 基础配置管理
- **网站信息配置**：网站名称、描述、主标题、副标题
- **显示设置**：每页显示画集数量、主题选择、语言设置
- **功能开关**：搜索功能、分类功能的启用/禁用
- **配置操作**：保存配置、重置为默认配置

### 🎨 画集管理
- **画集CRUD**：创建、编辑、删除画集
- **画集信息**：标题、作者、封面图片、描述、分类、标签
- **发布控制**：画集发布状态管理
- **批量操作**：支持批量管理多个画集

### 🖼️ 作品管理
- **作品CRUD**：在指定画集中添加、编辑、删除作品
- **作品信息**：标题、作者、图片、描述、创作年代、材质技法
- **画集关联**：作品与画集的关联管理
- **顺序管理**：作品在画集中的显示顺序

## 技术架构

### 数据层
```
src/services/masterpiecesConfigService.ts
```
- 配置数据的CRUD操作
- 画集数据的CRUD操作
- 作品数据的CRUD操作
- 分类和标签的管理

### 业务逻辑层
```
src/hooks/useMasterpiecesConfig.ts
```
- 配置状态管理
- 画集状态管理
- 作品状态管理
- 错误处理和加载状态

### 表现层
```
src/app/(pages)/testField/(utility)/ShowMasterPieces/config/page.tsx
```
- 标签页导航（基础配置、画集管理、作品管理）
- 表单组件和数据绑定
- 弹窗组件和交互逻辑

## 使用指南

### 访问配置页面
1. 在 ShowMasterPieces 主页面点击右上角的设置图标
2. 或直接访问 `/testField/ShowMasterPieces/config`

### 基础配置
1. 点击"基础配置"标签页
2. 修改网站名称、描述等基本信息
3. 调整显示设置和功能开关
4. 点击"保存配置"按钮保存更改
5. 可点击"重置默认"恢复默认配置

### 画集管理
1. 点击"画集管理"标签页
2. 点击"添加画集"创建新画集
3. 填写画集信息：标题、作者、封面图片等
4. 设置分类和标签
5. 选择是否发布画集
6. 使用编辑/删除按钮管理现有画集

### 作品管理
1. 点击"作品管理"标签页
2. 从下拉菜单选择要管理的画集
3. 点击"添加作品"在选中画集中添加作品
4. 填写作品信息：标题、作者、图片URL等
5. 使用编辑/删除按钮管理现有作品

## 数据结构

### 配置数据 (MasterpiecesConfig)
```typescript
{
  siteName: string;           // 网站名称
  siteDescription: string;    // 网站描述
  heroTitle: string;          // 主标题
  heroSubtitle: string;       // 副标题
  maxCollectionsPerPage: number; // 每页显示画集数量
  enableSearch: boolean;      // 启用搜索
  enableCategories: boolean;  // 启用分类
  defaultCategory: string;    // 默认分类
  theme: 'light' | 'dark' | 'auto'; // 主题
  language: 'zh' | 'en';      // 语言
}
```

### 画集数据 (ArtCollection)
```typescript
{
  id: number;                 // 画集ID
  title: string;              // 标题
  artist: string;             // 作者
  coverImage: string;         // 封面图片URL
  description: string;        // 描述
  category?: string;          // 分类
  tags?: string[];            // 标签
  isPublished?: boolean;      // 是否发布
  pages: ArtworkPage[];       // 作品列表
  createdAt?: string;         // 创建时间
  updatedAt?: string;         // 更新时间
}
```

### 作品数据 (ArtworkPage)
```typescript
{
  id: number;                 // 作品ID
  title: string;              // 标题
  image: string;              // 图片URL
  artist: string;             // 作者
  description?: string;       // 描述
  year?: string;              // 创作年代
  medium?: string;            // 材质技法
}
```

## 数据持久化

当前版本使用内存存储模拟数据持久化，在实际部署时可以：

1. **本地存储**：使用 localStorage 保存配置数据
2. **文件存储**：将数据保存为 JSON 文件
3. **数据库存储**：连接 MySQL、PostgreSQL 等数据库
4. **云存储**：使用 Firebase、Supabase 等云服务

## 扩展功能

### 图片上传
- 集成图片上传服务（如 Cloudinary、AWS S3）
- 支持本地图片上传和管理
- 图片压缩和格式优化

### 批量导入
- 支持 CSV/Excel 文件批量导入画集和作品
- 提供数据模板下载
- 数据验证和错误提示

### 权限管理
- 用户角色和权限控制
- 操作日志记录
- 数据备份和恢复

### 国际化
- 多语言界面支持
- 内容的多语言版本管理
- 自动翻译集成

## 故障排除

### 常见问题

1. **配置保存失败**
   - 检查网络连接
   - 验证表单数据格式
   - 查看浏览器控制台错误信息

2. **图片显示异常**
   - 确认图片URL有效性
   - 检查图片格式支持
   - 验证跨域访问权限

3. **数据丢失**
   - 当前版本数据存储在内存中，刷新页面会重置
   - 建议定期导出重要数据
   - 考虑升级到持久化存储方案

### 技术支持

如遇到技术问题，请：
1. 查看浏览器控制台错误信息
2. 检查网络请求状态
3. 验证数据格式和类型
4. 联系开发团队获取支持

## 更新日志

### v1.0.0 (当前版本)
- ✅ 基础配置管理
- ✅ 画集CRUD操作
- ✅ 作品CRUD操作
- ✅ 响应式界面设计
- ✅ 表单验证和错误处理

### 计划功能
- 🔄 数据持久化存储
- 🔄 图片上传功能
- 🔄 批量导入导出
- �� 用户权限管理
- 🔄 操作日志记录 