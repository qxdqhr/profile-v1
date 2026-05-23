import { NextRequest, NextResponse } from 'next/server';
import { ticketMonitorDb } from '@/modules/ticketMonitor/db/ticketMonitorDbService';
import { buildTestMessage } from '@/modules/ticketMonitor/server/notifications/buildTicketMessage';
import { sendFeishuPostMessage } from '@/modules/ticketMonitor/server/notifications/feishuNotifier';
import { isMaskedValue, verifyAdminToken } from '@/modules/ticketMonitor/api/lib/auth';

export async function POST(request: NextRequest) {
  const unauthorized = verifyAdminToken(request);
  if (unauthorized) return unauthorized;

  const config = await ticketMonitorDb.getConfigForNotify();
  let body: { feishuWebhookUrl?: string; feishuSignSecret?: string } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const webhookUrl = body.feishuWebhookUrl?.trim()
    || (isMaskedValue(config.feishuWebhookUrl) ? '' : config.feishuWebhookUrl?.trim())
    || '';

  if (!webhookUrl || !webhookUrl.startsWith('https://')) {
    return NextResponse.json(
      { success: false, error: '请提供有效的飞书 Webhook URL' },
      { status: 400 },
    );
  }

  const signSecret = body.feishuSignSecret?.trim()
    || (isMaskedValue(config.feishuSignSecret) ? undefined : config.feishuSignSecret);

  const result = await sendFeishuPostMessage(
    webhookUrl,
    buildTestMessage(),
    signSecret,
  );

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.errorMessage || '发送失败' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, data: { status: result.status } });
}
