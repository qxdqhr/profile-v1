import { registerCoreAiTasks as registerSa2kitCoreTasks } from 'sa2kit/common/aiApi/server';
import { registerTeachHubAiTasks } from '../ai/generateLessonTask';

let registered = false;

/** teach-hub 服务端 AI 任务单点注册（sa2kit 内置 + teach.generateLesson） */
export function ensureTeachHubAiTasksRegistered(): void {
  if (registered) return;
  registerSa2kitCoreTasks();
  registerTeachHubAiTasks();
  registered = true;
}
