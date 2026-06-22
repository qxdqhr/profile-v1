import { NextResponse } from 'next/server';

/**
 * 目标契约（管理端 / 新接口）：
 * - 成功：`{ data: T }`
 * - 错误：`{ error: string }` 或 `{ error: { code, message } }`
 *
 * 预订公开写读（sa2kit 1.6.114）仍依赖裸对象或 string `error`，勿改成功体。
 */

/** 简单错误（sa2kit parseErrorMessage 识别 string `error`） */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** 目标成功体 `{ data }` */
export function apiData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

/** 带 code 的结构化错误（同时保留 string `error` 供旧客户端） */
export function apiErrorWithCode(
  code: string,
  message: string,
  status: number = 500,
) {
  return NextResponse.json(
    { error: message, errorDetail: { code, message } },
    { status },
  );
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
