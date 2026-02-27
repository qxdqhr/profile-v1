type SessionState = {
  sessionId: string;
  examType: string;
  updatedAt: number;
  payload: unknown;
};

const sessionStore = new Map<string, SessionState>();

export function createExamRealtimeSession(examType: string) {
  const sessionId = `exam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const state: SessionState = {
    sessionId,
    examType,
    updatedAt: Date.now(),
    payload: null,
  };

  sessionStore.set(sessionId, state);
  return state;
}

export function updateExamRealtimeState(sessionId: string, payload: unknown) {
  const existing = sessionStore.get(sessionId);
  if (!existing) return null;

  const next = {
    ...existing,
    payload,
    updatedAt: Date.now(),
  };

  sessionStore.set(sessionId, next);
  return next;
}

export function getExamRealtimeState(sessionId: string) {
  return sessionStore.get(sessionId) || null;
}
