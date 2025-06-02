import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '../../services/authDbService';

/**
 * 处理用户登出请求
 */
export async function POST(request: NextRequest) {
  console.log('🚪 [API/logout] 收到登出请求');
  try {
    // 从cookie中获取会话令牌
    const sessionToken = request.cookies.get('session_token')?.value;
    console.log('🎫 [API/logout] 提取的session_token:', sessionToken ? sessionToken.substring(0, 8) + '...' : 'null');
    
    if (sessionToken) {
      console.log('🗑️ [API/logout] 删除会话...');
      // 删除会话
      await authDbService.deleteSession(sessionToken);
      console.log('✅ [API/logout] 会话删除成功');
    } else {
      console.log('⚠️ [API/logout] 未找到会话令牌，直接清除cookie');
    }
    
    // 清除cookie
    const response = NextResponse.json({ 
      success: true, 
      message: '登出成功' 
    });
    
    // 删除session_token cookie
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0, // 立即过期
      path: '/',
    });
    
    console.log('✅ [API/logout] 登出流程完成');
    return response;
    
  } catch (error) {
    console.error('💥 [API/logout] 登出异常:', error);
    
    // 即使出现错误，也要尝试清除cookie
    const response = NextResponse.json(
      { success: false, message: '登出失败，但已清除本地状态' },
      { status: 500 }
    );
    
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  }
} 