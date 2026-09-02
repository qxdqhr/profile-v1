import {
  buildContactFeishuMessage,
  formatDateTime,
  type ContactSubmission,
} from '@sa2kit/feishu-bot';

export type { ContactSubmission };
export { buildContactFeishuMessage };

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
