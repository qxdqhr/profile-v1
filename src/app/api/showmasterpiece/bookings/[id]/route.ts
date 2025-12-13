// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';

/**
 * ShowMasterpiece 模块 - 单个预订API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 单个预订API代理
 */

// 直接从模块内导出API实现
export * from '@/modules/showmasterpiece/api/bookings/[id]/route';