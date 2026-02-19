import { NextRequest, NextResponse } from 'next/server';

type SyncEventType = 'launch' | 'danmaku';

interface FireworksSyncEvent {
  id: string;
  roomId: string;
  type: SyncEventType;
  payload: Record<string, unknown>;
  createdAt: number;
}

const MAX_EVENTS_PER_ROOM = 500;
const MAX_PAYLOAD_BYTES = 8 * 1024;
const DEFAULT_ROOM_ID = 'testfield-default';

declare global {
  // eslint-disable-next-line no-var
  var __mikuFireworksSyncStore: Map<string, FireworksSyncEvent[]> | undefined;
}

function getStore() {
  if (!globalThis.__mikuFireworksSyncStore) {
    globalThis.__mikuFireworksSyncStore = new Map<string, FireworksSyncEvent[]>();
  }
  return globalThis.__mikuFireworksSyncStore;
}

function isValidType(value: unknown): value is SyncEventType {
  return value === 'launch' || value === 'danmaku';
}

function normalizeRoomId(roomId?: unknown) {
  if (typeof roomId !== 'string') return DEFAULT_ROOM_ID;
  const trimmed = roomId.trim();
  if (!trimmed) return DEFAULT_ROOM_ID;
  return trimmed.slice(0, 64);
}

function normalizePayload(type: SyncEventType, payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const source = payload as Record<string, unknown>;

  if (type === 'danmaku') {
    const text = typeof source.text === 'string' ? source.text.slice(0, 64) : '';
    return {
      ...source,
      text,
    };
  }

  return source;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = normalizeRoomId(searchParams.get('roomId'));
    const since = Number(searchParams.get('since') || 0);
    const limitRaw = Number(searchParams.get('limit') || 30);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 30;

    const events = getStore().get(roomId) ?? [];
    const filtered = Number.isFinite(since)
      ? events.filter((item) => item.createdAt > since)
      : events;

    return NextResponse.json({
      roomId,
      events: filtered.slice(-limit),
      total: events.length,
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error('Failed to read mikuFireworks3D sync events:', error);
    return NextResponse.json(
      { error: 'Failed to read sync events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roomId = normalizeRoomId(body?.roomId);
    const type = body?.type;

    if (!isValidType(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    const payload = normalizePayload(type, body?.payload);
    const payloadSize = new TextEncoder().encode(JSON.stringify(payload)).length;
    if (payloadSize > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    const event: FireworksSyncEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      roomId,
      type,
      payload,
      createdAt: Date.now(),
    };

    const store = getStore();
    const roomEvents = store.get(roomId) ?? [];
    roomEvents.push(event);
    if (roomEvents.length > MAX_EVENTS_PER_ROOM) {
      roomEvents.splice(0, roomEvents.length - MAX_EVENTS_PER_ROOM);
    }
    store.set(roomId, roomEvents);

    return NextResponse.json({
      success: true,
      event,
      total: roomEvents.length,
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error('Failed to write mikuFireworks3D sync event:', error);
    return NextResponse.json(
      { error: 'Failed to write sync event' },
      { status: 500 }
    );
  }
}
