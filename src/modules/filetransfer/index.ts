/**
 * 文件传输模块 - 主入口文件
 * 
 * 这是一个完整的文件传输模块，提供了从前端组件到后端API的完整解决方案。
 * 主要功能包括：
 * - 文件上传和下载
 * - 传输状态管理
 * - 文件列表展示
 * - 权限控制
 * 
 * 架构特点：
 * - 前后端分离，支持服务端渲染
 * - 模块化设计，便于维护和扩展
 * - TypeScript严格类型检查
 * - Tailwind CSS样式
 * 
 * @version 1.0.0
 * @author Profile-v1 Team
 */

// ===== 客户端组件导出 =====
export { FileTransferCard } from './components/FileTransferCard';
export { FileUploader } from './components/FileUploader';
export { default as FileTransferPage } from './pages/FileTransferPage';

// ===== 类型导出 =====
export type {
  FileTransfer,
  FileTransferConfig,
  UploadResponse,
  DownloadResponse,
  TransferStatus,
} from './types';

// ===== 模块信息 =====
/** 模块版本号 */
export const FILETRANSFER_MODULE_VERSION = '1.0.0';

/** 模块名称标识 */
export const FILETRANSFER_MODULE_NAME = '@profile-v1/filetransfer'; 