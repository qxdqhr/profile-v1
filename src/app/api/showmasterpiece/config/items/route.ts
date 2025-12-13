// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';

/**
 * ShowMasterpiece模块 - 配置项API代理路由
 * 
 * 代理到模块内部的API实现
 */

export { GET, POST } from '@/modules/showmasterpiece/api/config/items/route';
