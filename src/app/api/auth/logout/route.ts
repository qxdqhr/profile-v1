import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';

export async function POST(request: NextRequest) {
  try {
    // 从cookie中获取会话令牌
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (sessionToken) {
      // 删除会话
      await authDbService.deleteSession(sessionToken);
    }
    
    // 清除cookie
    const response = NextResponse.json({ success: true, message: '登出成功' });
    response.cookies.delete('session_token');
    
    return response;
    
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { success: false, message: '登出失败' },
      { status: 500 }
    );
  }
} 