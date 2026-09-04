import { ensureTeachHubAiTasksRegistered } from '@lib/registerTasks';

export async function register() {
  ensureTeachHubAiTasksRegistered();
}
