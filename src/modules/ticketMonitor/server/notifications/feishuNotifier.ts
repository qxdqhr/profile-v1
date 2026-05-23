import { createHmac } from 'crypto';
import type { FeishuPostMessage } from './buildTicketMessage';

export interface FeishuSendResult {
  success: boolean;
  status: number;
  errorMessage?: string;
}

function buildSignHeaders(secret: string): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sign = createHmac('sha256', secret)
    .update(`${timestamp}\n${secret}`)
    .digest('base64');

  return {
    timestamp,
    sign,
  };
}

export async function sendFeishuPostMessage(
  webhookUrl: string,
  message: FeishuPostMessage,
  signSecret?: string | null,
): Promise<FeishuSendResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (signSecret?.trim()) {
    Object.assign(headers, buildSignHeaders(signSecret.trim()));
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        errorMessage: text || `HTTP ${response.status}`,
      };
    }

    try {
      const json = JSON.parse(text) as { code?: number; msg?: string };
      if (json.code !== undefined && json.code !== 0) {
        return {
          success: false,
          status: response.status,
          errorMessage: json.msg || `Feishu code ${json.code}`,
        };
      }
    } catch {
      // non-json success body is acceptable
    }

    return { success: true, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: 0,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
