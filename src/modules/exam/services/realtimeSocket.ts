export interface ExamRealtimeMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface ExamRealtimeClient {
  connect: () => void;
  disconnect: () => void;
  send: (message: ExamRealtimeMessage) => void;
  onMessage: (listener: (message: ExamRealtimeMessage) => void) => () => void;
}

export class BrowserExamRealtimeClient implements ExamRealtimeClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<(message: ExamRealtimeMessage) => void>();

  constructor(private readonly url: string) {}

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as ExamRealtimeMessage;
        this.listeners.forEach((listener) => listener(parsed));
      } catch {
        // ignore malformed events
      }
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  send(message: ExamRealtimeMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    this.socket.send(JSON.stringify(message));
  }

  onMessage(listener: (message: ExamRealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
