/**
 * API 响应工具函数
 *
 * 统一 showmasterpiece 模块 API 的响应格式：
 *   - 成功：直接返回数据（保持原有 shape，不额外包裹）
 *   - 错误：{ error: string }
 */
import { NextResponse } from 'next/server';

/** 统一错误响应 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}
