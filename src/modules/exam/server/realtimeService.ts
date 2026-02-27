import { EventEmitter } from 'events';

const examRealtimeBus = new EventEmitter();

export function publishExamRealtimeEvent(sessionId: string, payload: unknown) {
  examRealtimeBus.emit(`exam:${sessionId}`, payload);
}

export function subscribeExamRealtimeEvent(
  sessionId: string,
  listener: (payload: unknown) => void
) {
  const eventName = `exam:${sessionId}`;
  examRealtimeBus.on(eventName, listener);

  return () => {
    examRealtimeBus.off(eventName, listener);
  };
}
