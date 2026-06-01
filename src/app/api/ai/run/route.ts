export { POST } from '@/modules/aiApi/api/run/route';

// 注册各业务模块的 AI 任务（side-effect）
import '@/modules/calendar/ai/registerTasks';
