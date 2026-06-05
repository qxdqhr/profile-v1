import type { FeishuPostMessage } from '@/modules/ticketMonitor/server/notifications/buildTicketMessage';

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  clientIp?: string;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function buildContactFeishuMessage(
  submission: ContactSubmission,
): FeishuPostMessage {
  const lines = [
    `姓名：${submission.name}`,
    `邮箱：${submission.email}`,
    `时间：${formatDateTime(submission.submittedAt)}`,
    submission.clientIp ? `来源 IP：${submission.clientIp}` : '',
    '',
    '留言内容：',
    submission.message,
  ].filter((line) => line !== '');

  return {
    msg_type: 'post',
    content: {
      post: {
        zh_cn: {
          title: '【首页留言】',
          content: lines.map((line) => [{ tag: 'text', text: line }]),
        },
      },
    },
  };
}

export function buildContactQqMessage(submission: ContactSubmission): string {
  return [
    '【首页新留言】',
    `姓名：${submission.name}`,
    `邮箱：${submission.email}`,
    `时间：${formatDateTime(submission.submittedAt)}`,
    submission.clientIp ? `来源 IP：${submission.clientIp}` : '',
    '',
    '留言内容：',
    submission.message,
  ].filter(Boolean).join('\n');
}
