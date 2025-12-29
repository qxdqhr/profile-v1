/**
 * ShowMasterpiece 模块 - 预订管理API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 预订管理API代理
 */

// 导出API实现
export { GET } from '@/modules/showmasterpiece/api/bookings/admin/route';

// 直接定义路由段配置（不能重新导出）
export const dynamic = 'force-dynamic';
export const revalidate = 0;