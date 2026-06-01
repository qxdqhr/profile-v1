import { registerAiTask } from './taskRegistry';
import { coreStructuredMultimodalTask } from './tasks/coreStructuredMultimodal';

let coreRegistered = false;

export function registerCoreAiTasks(): void {
  if (coreRegistered) return;
  registerAiTask(coreStructuredMultimodalTask);
  coreRegistered = true;
}
