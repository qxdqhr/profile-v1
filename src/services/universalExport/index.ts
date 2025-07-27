/**
 * 通用导出服务模块入口
 */

// 导出核心服务类
export { UniversalExportService } from './UniversalExportService';

// 导出所有类型
export type * from './types';

// 导出异常类
export {
  ExportServiceError,
  ExportConfigError,
  ExportDataError,
  ExportFileError
} from './types';

// 导出常量
export const UNIVERSAL_EXPORT_SERVICE_VERSION = '1.0.0';
export const UNIVERSAL_EXPORT_SERVICE_NAME = '@profile-v1/universal-export-service'; 