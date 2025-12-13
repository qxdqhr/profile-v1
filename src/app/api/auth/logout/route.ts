// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';

// 直接导出auth模块中的logout路由处理程序
export { POST } from '@/modules/auth/api/logout/route'; 