import type { TicketEvent } from '../../types';
import { SOURCE_LABEL_MAP } from '../../types';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function estimateDaysLeft(ticketEndAt: string, now = Date.now()): number {
  const endMs = new Date(ticketEndAt).getTime();
  if (!Number.isFinite(endMs)) return 0;
  return Math.max(0, Math.ceil((endMs - now) / (24 * 60 * 60 * 1000)));
}

export interface FeishuPostMessage {
  msg_type: 'post';
  content: {
    post: {
      zh_cn: {
        title: string;
        content: Array<Array<{ tag: string; text?: string; href?: string }>>;
      };
    };
  };
}

function buildPost(title: string, lines: string[], link?: { text: string; href: string }): FeishuPostMessage {
  const content: Array<Array<{ tag: string; text?: string; href?: string }>> = lines
    .filter(Boolean)
    .map((line) => [{ tag: 'text', text: line }]);

  if (link) {
    content.push([{ tag: 'a', text: link.text, href: link.href }]);
  }

  return {
    msg_type: 'post',
    content: {
      post: {
        zh_cn: { title, content },
      },
    },
  };
}

export function buildNewEventMessage(event: TicketEvent): FeishuPostMessage {
  const lines = [
    `平台：${SOURCE_LABEL_MAP[event.source]}`,
    `演出：${event.title}`,
    event.receptionTitle ? `受付：${event.receptionTitle}` : '',
    event.seatInfo ? `席位：${event.seatInfo}` : '',
    `开票时间：${formatDateTime(event.ticketOpenAt)}`,
    event.ticketEndAt ? `截止售卖：${formatDateTime(event.ticketEndAt)}` : '',
  ];

  return buildPost('【票务监控·新演出】', lines, { text: '前往官网', href: event.eventUrl });
}

export function buildEndingSoonMessage(event: TicketEvent, thresholdDays: number): FeishuPostMessage {
  const daysLeft = estimateDaysLeft(event.ticketEndAt!);
  const lines = [
    `平台：${SOURCE_LABEL_MAP[event.source]}`,
    `演出：${event.title}`,
    event.receptionTitle ? `受付：${event.receptionTitle}` : '',
    `提醒档位：${thresholdDays} 天`,
    `截止售卖：${formatDateTime(event.ticketEndAt!)}`,
    `剩余：约 ${daysLeft} 天`,
  ];

  return buildPost('【票务监控·即将截止】', lines, { text: '前往官网', href: event.eventUrl });
}

export function buildTestMessage(): FeishuPostMessage {
  return buildPost('【票务监控·测试消息】', [
    '飞书 Webhook 配置成功。',
    `发送时间：${formatDateTime(new Date().toISOString())}`,
  ]);
}

export { formatDateTime, estimateDaysLeft };
