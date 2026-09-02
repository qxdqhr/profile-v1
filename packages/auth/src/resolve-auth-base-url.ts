/**
 * 浏览器里的 Better Auth 请求落点。
 * 生产同域（nginx）继续用当前 origin，打到主站 `/api/auth`。
 * 本地多端口时改打 `NEXT_PUBLIC_APP_URL`（主站 :3000），避免子应用再挂鉴权面。
 */
export function resolveAuthBaseURL(input: {
  windowOrigin?: string;
  windowHostname?: string;
  configured?: string;
  fallback?: string;
}): string {
  const fallback = input.fallback ?? 'http://localhost:3000';
  const configured = input.configured?.trim();

  if (input.windowOrigin && input.windowHostname) {
    const isLocalHost =
      input.windowHostname === 'localhost' || input.windowHostname === '127.0.0.1';
    if (isLocalHost && configured) {
      try {
        const cfg = new URL(configured);
        if (cfg.hostname === 'localhost' || cfg.hostname === '127.0.0.1') {
          return `${cfg.protocol}//${cfg.host}`;
        }
      } catch {
        // 配置不是合法 URL 时退回当前 origin
      }
    }
    return input.windowOrigin;
  }

  return configured || fallback;
}
