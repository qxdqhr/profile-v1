export type ExamRealtimeEvent =
  | { type: 'session.joined'; sessionId: string; userId: string }
  | { type: 'answer.changed'; sessionId: string; questionId: string; payload: unknown }
  | { type: 'exam.submitted'; sessionId: string; payload: unknown };

export interface ExamRealtimeClient {
  connect(sessionId: string, userId: string): void;
  disconnect(): void;
  send(event: ExamRealtimeEvent): void;
  onEvent(handler: (event: ExamRealtimeEvent) => void): () => void;
}

export class BrowserExamRealtimeClient implements ExamRealtimeClient {
  private ws: WebSocket | null = null;
  private handlers: Array<(event: ExamRealtimeEvent) => void> = [];

  connect(sessionId: string, userId: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/exam/realtime/ws?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId)}`;

    this.ws = new WebSocket(url);
    this.ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as ExamRealtimeEvent;
        this.handlers.forEach((handler) => handler(event));
      } catch {
        // ignore malformed payloads
      }
    };
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  send(event: ExamRealtimeEvent) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(event));
  }

  onEvent(handler: (event: ExamRealtimeEvent) => void) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((item) => item !== handler);
    };
  }
}
