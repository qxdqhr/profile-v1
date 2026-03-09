import type { TicketEvent, TicketEventsQuery, TicketEventsResult, TicketSource } from '../types';
import { eplusAdapter } from './adapters/eplusAdapter';
import { asobistoreAdapter } from './adapters/asobistoreAdapter';
import { piaproAdapter } from './adapters/piaproAdapter';
import { lawsonTicketAdapter } from './adapters/lawsonTicketAdapter';

const sourceAdapterMap: Record<TicketSource, () => Promise<TicketEvent[]>> = {
  eplus: eplusAdapter,
  asobistore: asobistoreAdapter,
  piapro: piaproAdapter,
  lawsonticket: lawsonTicketAdapter,
};

const fallbackSourceData: Record<TicketSource, Omit<TicketEvent, 'fetchedAt'>[]> = {
  eplus: [
    {
      id: 'eplus-fallback-1',
      title: 'eplus 动漫活动（回退数据）',
      source: 'eplus',
      ticketOpenAt: new Date().toISOString(),
      status: 'unknown',
      eventUrl: 'https://eplus.jp/sf/live/anime',
      tags: ['fallback'],
    },
  ],
  asobistore: [
    {
      id: 'asobistore-fallback-1',
      title: 'asobistore 活动资讯（回退数据）',
      source: 'asobistore',
      ticketOpenAt: new Date().toISOString(),
      status: 'unknown',
      eventUrl: 'https://asobistore.jp/event-ticket/List',
      tags: ['fallback'],
    },
  ],
  piapro: [
    {
      id: 'piapro-fallback-1',
      title: 'piapro 活动页（回退数据）',
      source: 'piapro',
      ticketOpenAt: new Date().toISOString(),
      status: 'unknown',
      eventUrl: 'https://piapro.net/event',
      tags: ['fallback'],
    },
  ],
  lawsonticket: [
    {
      id: 'lawsonticket-fallback-1',
      title: 'LawsonTicket 活动页（回退数据）',
      source: 'lawsonticket',
      ticketOpenAt: new Date().toISOString(),
      status: 'unknown',
      eventUrl: 'https://l-tike.com/',
      tags: ['fallback'],
    },
  ],
};

export async function getTicketEvents(query: TicketEventsQuery): Promise<TicketEventsResult> {
  const sources = query.sources?.length
    ? query.sources
    : (Object.keys(sourceAdapterMap) as TicketSource[]);

  const tasks = sources.map(async (source) => {
    try {
      const adapter = sourceAdapterMap[source];
      const events = await adapter();
      return { source, events, error: null as string | null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { source, events: [] as TicketEvent[], error: message };
    }
  });

  const settled = await Promise.all(tasks);
  const errors: string[] = [];

  const events = settled.flatMap((result) => {
    if (!result.error) {
      return result.events;
    }

    errors.push(`${result.source}: ${result.error}`);
    console.error('[ticket-monitor] source fetch failed:', result.source, result.error);
    const fallback = fallbackSourceData[result.source] || [];
    const fetchedAt = new Date().toISOString();
    return fallback.map((item) => ({ ...item, fetchedAt }));
  });

  const normalizedQ = query.q?.trim().toLowerCase();

  const filtered = events.filter((event) => {
    const matchesQ = !normalizedQ
      || event.title.toLowerCase().includes(normalizedQ)
      || event.tags?.some((tag) => tag.toLowerCase().includes(normalizedQ));

    const matchesStatus = !query.status || event.status === query.status;

    return matchesQ && matchesStatus;
  });

  const sorted = filtered.sort((a, b) => {
    if (query.sortByEndAtDesc) {
      const aEnd = a.ticketEndAt ? new Date(a.ticketEndAt).getTime() : Number.NEGATIVE_INFINITY;
      const bEnd = b.ticketEndAt ? new Date(b.ticketEndAt).getTime() : Number.NEGATIVE_INFINITY;
      return bEnd - aEnd;
    }

    return new Date(a.ticketOpenAt).getTime() - new Date(b.ticketOpenAt).getTime();
  });

  const limit = query.limit && query.limit > 0 ? query.limit : 50;

  return {
    events: sorted.slice(0, limit),
    errors,
  };
}
