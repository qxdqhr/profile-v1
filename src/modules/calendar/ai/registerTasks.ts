import { registerAiTask } from 'sa2kit/common/aiApi';
import { calendarEventFromImageTask } from './eventFromImageTask';

let registered = false;

export function registerCalendarAiTasks(): void {
  if (registered) return;
  registerAiTask(calendarEventFromImageTask);
  registered = true;
}

registerCalendarAiTasks();
