import { registerAiTask } from './taskRegistry';
import { coreStructuredMultimodalTask } from './tasks/coreStructuredMultimodal';
import { coreConnectivityTestTask } from './tasks/coreConnectivityTest';

let coreRegistered = false;

export function registerCoreAiTasks(): void {
  if (coreRegistered) return;
  registerAiTask(coreStructuredMultimodalTask);
  registerAiTask(coreConnectivityTestTask);
  coreRegistered = true;
}
