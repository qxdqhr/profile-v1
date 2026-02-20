/**
 * ShowMasterpiece 模块 - 画集API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 画集API代理
 */

// 直接从模块内导出API实现
export { GET, POST, PATCH } from '@/modules/showmasterpiece/api/collections/route';