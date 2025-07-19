/**
 * ShowMasterpiece 模块 - 组件库导出
 * 
 * 这个文件导出了ShowMasterpiece模块中所有可复用的React组件。
 * 这些组件都采用了模块化设计，具有以下特点：
 * - 完全自包含，包含样式和逻辑
 * - 支持TypeScript类型检查
 * - 使用CSS Modules进行样式隔离
 * - 遵循React最佳实践
 * 
 * 组件分类：
 * - 展示组件：用于显示数据和内容
 * - 交互组件：用于用户操作和数据管理
 */

/** 
 * 画集卡片组件
 * 
 * 用于在画集列表页面展示单个画集的卡片视图。
 * 显示画集的封面图片、标题、艺术家等基本信息。
 * 支持点击跳转到画集详情页面。
 * 
 * 主要功能：
 * - 响应式设计，适配不同屏幕尺寸
 * - 悬停效果和动画
 * - 懒加载图片优化
 */
export { CollectionCard } from './CollectionCard';

/** 
 * 作品查看器组件
 * 
 * 用于展示画集中单个作品的详细内容。
 * 支持全屏查看、图片缩放、左右导航等功能。
 * 
 * 主要功能：
 * - 高质量图片展示
 * - 作品信息显示（标题、艺术家、描述等）
 * - 键盘导航支持
 * - 移动端手势支持
 */
export { ArtworkViewer } from './ArtworkViewer';

/** 
 * 缩略图侧边栏组件
 * 
 * 在作品查看页面提供画集中所有作品的缩略图导航。
 * 用户可以快速预览和跳转到任意作品。
 * 
 * 主要功能：
 * - 缩略图网格布局
 * - 当前作品高亮显示
 * - 滚动自动定位
 * - 点击快速跳转
 */
export { ThumbnailSidebar } from './ThumbnailSidebar';

/**
 * 通用顺序管理器组件
 * 
 * 抽象的通用排序组件，可以用于任何具有顺序的数据管理。
 * 通过传入操作函数和渲染函数来实现不同类型数据的排序功能。
 * 
 * 主要功能：
 * - 拖拽排序
 * - 上移/下移按钮
 * - 批量保存和重置
 * - 通用的错误处理和加载状态
 * 
 * 注意：此组件已迁移到 @/components/GenericOrderManager
 */
export { GenericOrderManager } from '@/components/GenericOrderManager';

/** 
 * 画集顺序管理器组件
 * 
 * 基于通用组件的画集排序组件，用于调整画集的显示顺序。
 * 支持拖拽排序和按钮操作。
 * 
 * 主要功能：
 * - 拖拽排序界面
 * - 上移/下移按钮
 * - 实时预览效果
 * - 批量顺序更新
 */
export { CollectionOrderManagerV2 as CollectionOrderManager } from './CollectionOrderManagerV2';

/**
 * 作品顺序管理器组件
 * 
 * 基于通用组件的作品排序组件，用于调整画集内作品的显示顺序。
 * 支持拖拽排序和按钮操作。
 * 
 * 主要功能：
 * - 拖拽排序界面
 * - 上移/下移按钮
 * - 实时预览效果  
 * - 批量顺序更新
 */
export { ArtworkOrderManagerV2 as ArtworkOrderManager } from './ArtworkOrderManagerV2';

/**
 * 基于通用组件的画集顺序管理器 V2
 * 
 * 使用通用顺序管理器重构的画集排序组件。
 * 代码更简洁，逻辑更清晰，易于维护。
 */
export { CollectionOrderManagerV2 } from './CollectionOrderManagerV2';

/**
 * 基于通用组件的作品顺序管理器 V2
 * 
 * 使用通用顺序管理器重构的作品排序组件。
 * 代码更简洁，逻辑更清晰，易于维护。
 */
export { ArtworkOrderManagerV2 } from './ArtworkOrderManagerV2';

/**
 * 作品图片上传组件
 * 
 * 使用通用文件服务，支持阿里云OSS存储。
 * 专门用于作品图片的上传和管理。
 * 
 * 主要功能：
 * - 拖拽上传和点击选择
 * - 自动上传到云存储
 * - 图片预览和删除
 * - 支持多种图片格式
 */
export { ArtworkImageUpload } from './ArtworkImageUpload';

/**
 * 画集封面图片上传组件
 * 
 * 使用通用文件服务，支持阿里云OSS存储。
 * 专门用于画集封面图片的上传和管理。
 * 
 * 主要功能：
 * - 拖拽上传和点击选择
 * - 自动上传到云存储
 * - 图片预览和删除
 * - 支持多种图片格式
 */
export { CoverImageUpload } from './CoverImageUpload';

/**
 * 通用图片上传组件
 * 
 * 使用通用文件服务，支持阿里云OSS存储。
 * 可在画集封面和作品图片之间复用，提供统一的用户体验。
 * 
 * 主要功能：
 * - 支持封面和作品两种业务类型
 * - 拖拽上传和点击选择
 * - 自动上传到云存储
 * - 图片预览和删除
 * - 支持多种图片格式
 * - 可配置的调试信息和测试按钮
 */
export { UniversalImageUpload } from './UniversalImageUpload';

/**
 * 预订弹窗组件
 * 
 * 使用现有的Modal组件包装预订页面，提供弹窗形式的预订功能。
 * 支持响应式设计，适配桌面端和移动端。
 * 
 * 主要功能：
 * - 弹窗形式的预订界面
 * - 画集选择和预订表单
 * - 完整的预订流程
 */
export { BookingModal } from './BookingModal';

/**
 * 预订页面组件
 * 
 * 完整的预订流程页面，包含画集选择和预订表单。
 * 支持步骤式操作，用户体验友好。
 * 
 * 主要功能：
 * - 画集列表展示和选择
 * - 预订表单（QQ号、数量、备注）
 * - 提交和状态管理
 */
export { BookingPage } from './BookingPage';

/**
 * 画集列表组件
 * 
 * 用于预订页面展示画集简略信息，包括封面、标题、艺术家和价格。
 * 支持选择和加载状态。
 * 
 * 主要功能：
 * - 画集卡片展示
 * - 价格显示
 * - 选择功能
 * - 加载和空状态处理
 */
export { CollectionList } from './CollectionList';

 