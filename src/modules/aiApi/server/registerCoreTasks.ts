import {
  registerCoreAiTasks as registerSa2kitCoreTasks,
  registerAiTask,
} from 'sa2kit/common/aiApi/server';
import { mimoAwareStructuredMultimodalTask } from './mimoStructuredMultimodalTask';

/** 先注册 MiMo 识图兼容任务，再注册 sa2kit 其余内置任务（重复 id 会跳过） */
export function registerCoreAiTasks() {
  registerAiTask(mimoAwareStructuredMultimodalTask);
  registerSa2kitCoreTasks();
}
