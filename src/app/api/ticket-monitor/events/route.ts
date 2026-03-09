import { NextRequest, NextResponse } from 'next/server';
import type { TicketSource, TicketStatus } from '@/modules/ticketMonitor/types';
import { getTicketEvents } from '@/modules/ticketMonitor/server/getTicketEvents';

const validSources: TicketSource[] = ['eplus', 'asobistore', 'piapro', 'lawsonticket'];
const validStatuses: TicketStatus[] = ['upcoming', 'on_sale', 'ended', 'unknown'];

function parseSources(searchParams: URLSearchParams): TicketSource[] | undefined {
  const fromMulti = searchParams.getAll('source');
  const fromComma = (searchParams.get('source') || '').split(',').map((item) => item.trim()).filter(Boolean);
  const merged = Array.from(new Set([...fromMulti, ...fromComma]));

  const sources = merged.filter((item): item is TicketSource => {
    return validSources.includes(item as TicketSource);
  });

  return sources.length ? sources : undefined;
}

function parseStatus(value: string | null): TicketStatus | undefined {
  if (!value) return undefined;
  if (!validStatuses.includes(value as TicketStatus)) return undefined;
  return value as TicketStatus;
}

function parseLimit(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.min(parsed, 100);
}

function parseSortByEndAtDesc(value: string | null): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q')?.trim() || undefined;
  const sources = parseSources(searchParams);
  const status = parseStatus(searchParams.get('status'));
  const sortByEndAtDesc = parseSortByEndAtDesc(searchParams.get('sortByEndAtDesc'));
  const limit = parseLimit(searchParams.get('limit'));

  const result = await getTicketEvents({ q, sources, status, sortByEndAtDesc, limit });

  return NextResponse.json({
    success: true,
    data: result.events,
    meta: {
      total: result.events.length,
      errors: result.errors,
      fetchedAt: new Date().toISOString(),
    },
  });
}
