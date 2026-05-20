import { NextResponse } from 'next/server';

/** 简单错误（部分旧接口仅 `{ error }`） */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** 与 sa2kit 管理端兼容：`{ success, error, ... }`，500 不附带 details */
export function apiFail(
  message: string,
  status: number = 500,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

/** 与 sa2kit 管理端兼容：`{ success, data, ... }` */
export function apiOk<T>(
  data: T,
  extra?: Record<string, unknown>,
  init?: ResponseInit,
) {
  return NextResponse.json({ success: true, data, ...extra }, init);
}

export function logRouteError(label: string, error: unknown) {
  if (error instanceof Error) {
    console.error(label, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(label, error);
  }
}

/** 500：仅记录日志，对外返回通用文案 */
export function handleRouteError(
  label: string,
  error: unknown,
  publicMessage: string,
  extra?: Record<string, unknown>,
) {
  logRouteError(label, error);
  return apiFail(publicMessage, 500, extra);
}
