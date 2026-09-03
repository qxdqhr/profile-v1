import {
  registerCoreAiTasks as registerSa2kitCoreTasks,
  registerAiTask,
} from 'sa2kit/common/aiApi/server';
import { mimoAwareStructuredMultimodalTask } from './mimoStructuredMultimodalTask';

/**
 * 主站 AI 任务注册（不含 teachHub — teach.generateLesson 仅由 @profile/teach-hub 注册）
 */
export function registerCoreAiTasks() {
  registerAiTask(mimoAwareStructuredMultimodalTask);
  registerSa2kitCoreTasks();
}
