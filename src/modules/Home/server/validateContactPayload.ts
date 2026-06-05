export interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
}

export interface ValidatedContactPayload {
  name: string;
  email: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactPayload(
  body: ContactRequestBody,
):
  | { ok: true; data: ValidatedContactPayload }
  | { ok: false; error: string }
  | { ok: false; honeypot: true } {
  if (typeof body.company === 'string' && body.company.trim()) {
    return { ok: false, honeypot: true };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > 50) {
    return { ok: false, error: '请填写 1-50 个字符的姓名' };
  }

  if (!email || email.length > 120 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: '请填写有效的邮箱地址' };
  }

  if (!message || message.length < 5 || message.length > 2000) {
    return { ok: false, error: '留言内容需在 5-2000 个字符之间' };
  }

  return { ok: true, data: { name, email, message } };
}
