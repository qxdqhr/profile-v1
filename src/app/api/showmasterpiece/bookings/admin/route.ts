/**
 * ShowMasterpiece 模块 - 预订管理API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 预订管理API代理
 */

// 直接从模块内导出API实现（包括 dynamic 和 revalidate 配置）
export { GET, dynamic, revalidate } from '@/modules/showmasterpiece/api/bookings/admin/route';