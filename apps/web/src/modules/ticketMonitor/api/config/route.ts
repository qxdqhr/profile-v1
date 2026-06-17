import { NextRequest, NextResponse } from 'next/server';
import {
  isTicketSource,
  TICKET_SOURCES,
} from '@/modules/ticketMonitor/types';
import { ticketMonitorDb } from '@/modules/ticketMonitor/db/ticketMonitorDbService';
import { isMaskedValue, verifyAdminToken } from '@/modules/ticketMonitor/api/lib/auth';

function parseConfigBody(body: Record<string, unknown>) {
  const newEventPlatforms = Array.isArray(body.newEventPlatforms)
    ? body.newEventPlatforms.filter((item): item is string => typeof item === 'string' && isTicketSource(item))
    : undefined;

  const endingSoonDaysList = Array.isArray(body.endingSoonDaysList)
    ? body.endingSoonDaysList
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item >= 1)
    : undefined;

  const feishuWebhookUrl = typeof body.feishuWebhookUrl === 'string'
    ? body.feishuWebhookUrl.trim()
    : body.feishuWebhookUrl === null
      ? null
      : undefined;

  const feishuSignSecret = typeof body.feishuSignSecret === 'string'
    ? body.feishuSignSecret.trim()
    : body.feishuSignSecret === null
      ? null
      : undefined;

  if (feishuWebhookUrl && !feishuWebhookUrl.startsWith('https://')) {
    throw new Error('feishuWebhookUrl must start with https://');
  }

  return {
    notificationsEnabled: typeof body.notificationsEnabled === 'boolean' ? body.notificationsEnabled : undefined,
    feishuWebhookUrl: feishuWebhookUrl !== undefined && !isMaskedValue(feishuWebhookUrl) ? feishuWebhookUrl : undefined,
    feishuSignSecret: feishuSignSecret !== undefined && !isMaskedValue(feishuSignSecret) ? feishuSignSecret : undefined,
    newEventEnabled: typeof body.newEventEnabled === 'boolean' ? body.newEventEnabled : undefined,
    newEventPlatforms,
    endingSoonEnabled: typeof body.endingSoonEnabled === 'boolean' ? body.endingSoonEnabled : undefined,
    endingSoonDaysList,
  };
}

export async function GET() {
  const config = await ticketMonitorDb.getConfigDto(true);

  return NextResponse.json({
    success: true,
    data: {
      ...config,
      availablePlatforms: TICKET_SOURCES,
    },
  });
}

export async function PUT(request: NextRequest) {
  const unauthorized = verifyAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json() as Record<string, unknown>;
    const parsed = parseConfigBody(body);
    await ticketMonitorDb.updateConfig(parsed);
    const masked = await ticketMonitorDb.getConfigDto(true);

    return NextResponse.json({
      success: true,
      data: {
        ...masked,
        availablePlatforms: TICKET_SOURCES,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
