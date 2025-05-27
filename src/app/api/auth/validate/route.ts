import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { SessionValidationResponse } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    // 从cookie中获取会话令牌
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json<SessionValidationResponse>(
        { valid: false, message: '未找到会话令牌' },
        { status: 401 }
      );
    }
    
    // 验证会话
    const validation = await authDbService.validateSession(sessionToken);
    
    if (!validation.valid) {
      return NextResponse.json<SessionValidationResponse>(
        { valid: false, message: '会话已过期或无效' },
        { status: 401 }
      );
    }
    
    return NextResponse.json<SessionValidationResponse>({
      valid: true,
      user: validation.user,
    });
    
  } catch (error) {
    console.error('会话验证失败:', error);
    return NextResponse.json<SessionValidationResponse>(
      { valid: false, message: '会话验证失败' },
      { status: 500 }
    );
  }
} 