// 强制动态渲染,避免构建时静态生成超时
export const dynamic = 'force-dynamic';

// 导入模块内部的API处理函数
export { GET, POST } from '@/modules/calendar/api/events/route'; 