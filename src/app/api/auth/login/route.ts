import { NextRequest, NextResponse } from 'next/server';
import { authDbService } from '@/db/services/authDbService';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone, code }: LoginRequest = await request.json();
    
    // 验证输入
    if (!phone || !code) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '请输入手机号和验证码' },
        { status: 400 }
      );
    }
    
    // 验证验证码
    const isCodeValid = await authDbService.verifyCode(phone, code, 'login');
    
    if (!isCodeValid) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '验证码错误或已过期' },
        { status: 401 }
      );
    }
    
    // 查找用户
    const user = await authDbService.findUserByPhone(phone);
    
    if (!user) {
      return NextResponse.json<LoginResponse>(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 创建会话
    const session = await authDbService.createSession(user.id);
    
    // 更新最后登录时间
    await authDbService.updateLastLogin(user.id);
    
    // 设置会话cookie
    const response = NextResponse.json<LoginResponse>({
      success: true,
      user,
      sessionToken: session.sessionToken,
      message: '登录成功',
    });
    
    // 设置HttpOnly cookie
    response.cookies.set('session_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json<LoginResponse>(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 