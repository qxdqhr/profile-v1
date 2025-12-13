// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';

// 重新导出模块中的API路由
export { GET } from '@/modules/showmasterpiece/api/tags/route'; 