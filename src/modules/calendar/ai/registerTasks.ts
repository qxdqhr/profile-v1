import { registerAiTask } from '@/modules/aiApi/server/taskRegistry';
import { calendarEventFromImageTask } from './eventFromImageTask';

let registered = false;

export function registerCalendarAiTasks(): void {
  if (registered) return;
  registerAiTask(calendarEventFromImageTask);
  registered = true;
}

registerCalendarAiTasks();
