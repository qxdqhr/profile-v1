import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { SessionValidationResponse } from '@/types/auth';

export async function GET(request: NextRequest) {
  console.log('🔍 [API/validate] 收到会话验证请求');
  try {
    // 打印所有cookies以便调试
    const cookies = request.cookies.getAll();
    console.log('🍪 [API/validate] 所有cookies:', cookies);
    
    // 从cookie中获取会话令牌
    const sessionToken = request.cookies.get('session_token')?.value;
    console.log('🎫 [API/validate] 提取的session_token:', sessionToken ? sessionToken.substring(0, 8) + '...' : 'null');
    
    if (!sessionToken) {
      console.log('❌ [API/validate] 未找到会话令牌');
      return NextResponse.json<SessionValidationResponse>(
        { valid: false, message: '未找到会话令牌' },
        { status: 401 }
      );
    }
    
    console.log('🔍 [API/validate] 开始验证会话...');
    // 验证会话
    const validation = await authDbService.validateSession(sessionToken);
    console.log('📄 [API/validate] 会话验证结果:', { 
      valid: validation.valid, 
      user: validation.user ? { id: validation.user.id, phone: validation.user.phone } : null 
    });
    
    if (!validation.valid) {
      console.log('❌ [API/validate] 会话验证失败');
      return NextResponse.json<SessionValidationResponse>(
        { valid: false, message: '会话已过期或无效' },
        { status: 401 }
      );
    }
    
    console.log('✅ [API/validate] 会话验证成功');
    return NextResponse.json<SessionValidationResponse>({
      valid: true,
      user: validation.user,
    });
    
  } catch (error) {
    console.error('💥 [API/validate] 会话验证异常:', error);
    return NextResponse.json<SessionValidationResponse>(
      { valid: false, message: '会话验证失败' },
      { status: 500 }
    );
  }
} 