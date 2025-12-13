/**
 * ShowMasterpiece 模块 - 单个活动API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 单个活动API代理
 */

// 直接从模块内导出API实现
export { GET, PUT, DELETE } from '@/modules/showmasterpiece/api/events/[id]/route';