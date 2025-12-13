/**
 * ShowMasterpiece 模块 - 标签API代理
 * 
 * 代理文件，调用模块内的实际实现
 * 
 * @fileoverview 标签API代理
 */

// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';

// 直接从模块内导出API实现
export { GET } from '@/modules/showmasterpiece/api/tags/route';