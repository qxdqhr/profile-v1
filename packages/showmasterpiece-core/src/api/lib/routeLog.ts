/** 非生产环境路由调试日志，避免 LOG1/LOG3 在生产泄露业务数据 */
export function routeDebug(label: string, meta?: unknown): void {
  if (process.env.NODE_ENV === 'production') return;
  if (meta !== undefined) {
    console.log(label, meta);
    return;
  }
  console.log(label);
}

export function routeWarn(label: string, meta?: unknown): void {
  if (process.env.NODE_ENV === 'production') return;
  if (meta !== undefined) {
    console.warn(label, meta);
    return;
  }
  console.warn(label);
}
